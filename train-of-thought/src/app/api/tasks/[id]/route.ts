import { deleteTask, updateTask, createNotification } from '@/lib/db/actions';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tasks, projects, sections } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

interface Params {
    params: Promise<{ id: string }>;
}

export async function PATCH(req: Request, { params }: Params) {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    try {
        const body = await req.json();

        // Fetch current state before updating so we can detect meaningful changes
        const [task] = await db
            .select({
                title:     tasks.title,
                projectId: tasks.projectId,
                sectionId: tasks.sectionId,
                priority:  tasks.priority,
                due:       tasks.due,
                assignees: tasks.assignees,
                done:      tasks.done,
            })
            .from(tasks)
            .where(eq(tasks.id, id));

        await updateTask(id, body);

        if (task) {
            try {
                const doneChanged     = body.done === true && !task.done;
                const priorityChanged = body.priority !== undefined && body.priority !== task.priority;
                const currentDue      = task.due ? task.due.toISOString().split('T')[0] : null;
                const dueChanged      = body.due !== undefined && body.due !== currentDue;

                if (doneChanged || priorityChanged || dueChanged) {
                    const [project] = await db
                        .select({ title: projects.title, accent: projects.accent })
                        .from(projects)
                        .where(eq(projects.id, task.projectId));

                    if (project) {
                        const [section] = await db.select({ title: sections.title }).from(sections).where(eq(sections.id, task.sectionId));
                        const others = (task.assignees ?? []).filter((aid: string) => aid !== userId);

                        if (doneChanged) {
                            const recipients = [userId, ...others];
                            await Promise.allSettled(
                                recipients.map((recipientId: string) =>
                                    createNotification({
                                        userId:        recipientId,
                                        type:          'completed',
                                        actorId:       userId,
                                        projectId:     task.projectId,
                                        projectTitle:  project.title,
                                        projectAccent: project.accent,
                                        taskId:        id,
                                        sectionTitle:  section?.title,
                                        subject:       task.title,
                                        text:          'COMPLETED',
                                    })
                                )
                            );
                        }

                        if (priorityChanged) {
                            const recipients = [userId, ...others];
                            await Promise.allSettled(
                                recipients.map((recipientId: string) =>
                                    createNotification({
                                        userId:        recipientId,
                                        type:          'project',
                                        actorId:       userId,
                                        projectId:     task.projectId,
                                        projectTitle:  project.title,
                                        projectAccent: project.accent,
                                        taskId:        id,
                                        sectionTitle:  section?.title,
                                        subject:       task.title,
                                        text:          'PRIORITY_CHANGED',
                                    })
                                )
                            );
                        }

                        if (dueChanged) {
                            const recipients = [userId, ...others];
                            await Promise.allSettled(
                                recipients.map((recipientId: string) =>
                                    createNotification({
                                        userId:        recipientId,
                                        type:          'project',
                                        actorId:       userId,
                                        projectId:     task.projectId,
                                        projectTitle:  project.title,
                                        projectAccent: project.accent,
                                        taskId:        id,
                                        sectionTitle:  section?.title,
                                        subject:       task.title,
                                        text:          'DUE_DATE_CHANGED',
                                    })
                                )
                            );
                        }
                    }
                }
            } catch (notifErr) {
                console.error('[PATCH /api/tasks/[id]] notification error:', notifErr);
            }
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('[PATCH /api/tasks/[id]]', err);
        return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
    }
}

export async function DELETE(_req: Request, { params }: Params) {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    try {
        // Fetch task + project info before deleting for activity log
        let taskTitle:    string | null = null;
        let projectId:    string | null = null;
        let projectTitle: string | null = null;
        let projectAccent: string | null = null;

        try {
            const [task] = await db
                .select({ title: tasks.title, projectId: tasks.projectId })
                .from(tasks)
                .where(eq(tasks.id, id));

            if (task) {
                taskTitle = task.title;
                projectId = task.projectId;

                const [project] = await db
                    .select({ title: projects.title, accent: projects.accent })
                    .from(projects)
                    .where(eq(projects.id, task.projectId));

                if (project) {
                    projectTitle  = project.title;
                    projectAccent = project.accent;
                }
            }
        } catch { /* best-effort */ }

        await deleteTask(id);

        // Activity only — task deleted
        if (projectId && projectTitle && projectAccent && taskTitle) {
            try {
                await createNotification({
                    userId,
                    type:          'project',
                    actorId:       userId,
                    projectId,
                    projectTitle,
                    projectAccent,
                    taskId:        id,
                    subject:       taskTitle,
                    text:          'TASK_DELETED',
                });
            } catch (notifErr) {
                console.error('[DELETE /api/tasks/[id]] notification error:', notifErr);
            }
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('[DELETE /api/tasks/[id]]', err);
        return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
    }
}
