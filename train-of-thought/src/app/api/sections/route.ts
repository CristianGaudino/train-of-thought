import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createSection } from '@/lib/db/actions';

export async function POST(req: Request) {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { projectId, title, order } = await req.json();
        const id = await createSection(projectId, title, order ?? 0);
        return NextResponse.json({ id }, { status: 201 });
    } catch (err) {
        console.error('[POST /api/sections]', err);
        return NextResponse.json({ error: 'Failed to create section' }, { status: 500 });
    }
}