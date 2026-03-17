import { createComment } from '@/lib/db/actions';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

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
        return NextResponse.json(comment, { status: 201 });
    } catch (err) {
        console.error('[POST /api/tasks/[id]/comments]', err);
        return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
    }
}
