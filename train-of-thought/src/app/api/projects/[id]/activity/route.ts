import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getActivityByProject } from '@/lib/db/data';

interface Params {
    params: Promise<{ id: string }>;
}

export async function GET(_req: Request, { params }: Params) {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    try {
        const activity = await getActivityByProject(id);
        return NextResponse.json(activity);
    } catch (err) {
        console.error('[GET /api/projects/[id]/activity]', err);
        return NextResponse.json({ error: 'Failed to fetch activity' }, { status: 500 });
    }
}
