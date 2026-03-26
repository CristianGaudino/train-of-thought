import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tasks, projects } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { createComment, createNotification } from '@/lib/db/actions';

interface Params {
    params: Promise<{ id: string }>;
}

export async function POST(req: Request, { params }: Params) {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: taskId } = await params;

    try {
        const { text } = await req.json();
        if (!text?.trim()) {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 });
        }

        const comment = await createComment(taskId, userId, text.trim());

        // ── Auto-create notifications for task assignees (except the commenter) ──
        try {
            const [task] = await db
                .select({
                    title:     tasks.title,
                    assignees: tasks.assignees,
                    projectId: tasks.projectId,
                })
                .from(tasks)
                .where(eq(tasks.id, taskId));

            if (task && task.projectId) {
                const [project] = await db
                    .select({ title: projects.title, accent: projects.accent })
                    .from(projects)
                    .where(eq(projects.id, task.projectId));

                if (project) {
                    // Include actor so the action is always recorded for activity;
                    // self-notifications are filtered out on the notifications page
                    const recipients = [
                        userId,
                        ...(task.assignees ?? []).filter((id: string) => id !== userId),
                    ];

                    await Promise.allSettled(
                        recipients.map((recipientId: string) =>
                            createNotification({
                                userId:        recipientId,
                                type:          'comment',
                                actorId:       userId,
                                projectId:     task.projectId,
                                projectTitle:  project.title,
                                projectAccent: project.accent,
                                taskId:        taskId,
                                subject:       task.title,
                                text:          'Commented on',
                            })
                        )
                    );
                }
            }
        } catch (notifErr) {
            // Don't fail the comment if notification creation fails
            console.error('[POST /api/tasks/[id]/comments] notification error:', notifErr);
        }

        return NextResponse.json(comment, { status: 201 });
    } catch (err) {
        console.error('[POST /api/tasks/[id]/comments]', err);
        return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
    }
}
