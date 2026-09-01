import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { projects, sections } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { createNotification, createTask } from '@/lib/db/actions';
import { getProjectAccess } from '@/lib/db/access';

export async function POST(req: Request) {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await req.json();
        const { sectionId, projectId, title, priority, due, assignees, order, description, subtasks } = body;

        if (!sectionId || !projectId || !title?.trim()) {
            return NextResponse.json(
                { error: 'sectionId, projectId and title are required' },
                { status: 400 }
            );
        }

        const access = await getProjectAccess(projectId, userId);
        if (!access) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        const task = await createTask(
            sectionId,
            projectId,
            {
                title:       title.trim(),
                priority:    priority  ?? 'Medium',
                due:         due       ?? null,
                assignees:   assignees ?? [userId],
                description: typeof description === 'string' ? description : undefined,
                subtasks:    Array.isArray(subtasks) ? subtasks : undefined,
            },
            order ?? 0,
        );

        // ── Activity-only entry for task creation (no notification bell) ──
        try {
            const [[project], [section]] = await Promise.all([
                db.select({ title: projects.title, accent: projects.accent }).from(projects).where(eq(projects.id, projectId)),
                db.select({ title: sections.title }).from(sections).where(eq(sections.id, sectionId)),
            ]);

            if (project) {
                await createNotification({
                    userId:        'activity',
                    type:          'project',
                    actorId:       userId,
                    projectId,
                    projectTitle:  project.title,
                    projectAccent: project.accent,
                    taskId:        task.id,
                    sectionTitle:  section?.title,
                    subject:       title.trim(),
                    text:          'TASK_CREATED',
                });
            }
        } catch (notifErr) {
            console.error('[POST /api/tasks] notification error:', notifErr);
        }

        return NextResponse.json(task, { status: 201 });
    } catch (err) {
        console.error('[POST /api/tasks]', err);
        return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
    }
}
