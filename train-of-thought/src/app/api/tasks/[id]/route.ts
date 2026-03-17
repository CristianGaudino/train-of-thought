import { deleteTask, updateTask } from '@/lib/db/actions';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

interface Params {
    params: Promise<{ id: string }>;
}

export async function PATCH(req: Request, { params }: Params) {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    try {
        const body = await req.json();
        await updateTask(id, body);
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
        await deleteTask(id);
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('[DELETE /api/tasks/[id]]', err);
        return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
    }
}
