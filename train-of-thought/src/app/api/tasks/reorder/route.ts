import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { reorderTasks } from '@/lib/db/actions';
import { hasAccessToAllTaskProjects } from '@/lib/db/access';

export async function POST(req: Request) {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const updates: { id: string; sectionId: string; order: number }[] = await req.json();

        const allowed = await hasAccessToAllTaskProjects(updates.map(u => u.id), userId);
        if (!allowed) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        await reorderTasks(updates);
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('[POST /api/tasks/reorder]', err);
        return NextResponse.json({ error: 'Failed to reorder tasks' }, { status: 500 });
    }
}
