import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { projects, sections } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { createNotification, createTask } from '@/lib/db/actions';

export async function POST(req: Request) {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await req.json();
        const { sectionId, projectId, title, priority, due, assignees, order } = body;

        if (!sectionId || !projectId || !title?.trim()) {
            return NextResponse.json(
                { error: 'sectionId, projectId and title are required' },
                { status: 400 }
            );
        }

        const task = await createTask(
            sectionId,
            projectId,
            {
                title:     title.trim(),
                priority:  priority  ?? 'Medium',
                due:       due       ?? null,
                assignees: assignees ?? [userId],
            },
            order ?? 0,
        );

        // ── Auto-create notifications for each assignee (except the creator) ──
        if (assignees && assignees.length > 0) {
            const [[project], [section]] = await Promise.all([
                db.select({ title: projects.title, accent: projects.accent }).from(projects).where(eq(projects.id, projectId)),
                db.select({ title: sections.title }).from(sections).where(eq(sections.id, sectionId)),
            ]);

            if (project) {
                const recipients = [
                    userId,
                    ...(assignees as string[]).filter((id: string) => id !== userId),
                ];
                await Promise.allSettled(
                    recipients.map((assigneeId: string) =>
                        createNotification({
                            userId:        assigneeId,
                            type:          'assigned',
                            actorId:       userId,
                            projectId,
                            projectTitle:  project.title,
                            projectAccent: project.accent,
                            taskId:        task.id,
                            sectionTitle:  section?.title,
                            subject:       title.trim(),
                            text:          'Assigned you to',
                        })
                    )
                );
            }
        }

        return NextResponse.json(task, { status: 201 });
    } catch (err) {
        console.error('[POST /api/tasks]', err);
        return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
    }
}
