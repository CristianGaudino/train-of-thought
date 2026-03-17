import { createTask } from '@/lib/db/actions';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await req.json();
        const { sectionId, projectId, title, priority, due, assignees, order } = body;

        if (!sectionId || !projectId || !title?.trim()) {
            return NextResponse.json({ error: 'sectionId, projectId and title are required' }, { status: 400 });
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

        return NextResponse.json(task, { status: 201 });
    } catch (err) {
        console.error('[POST /api/tasks]', err);
        return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
    }
}
