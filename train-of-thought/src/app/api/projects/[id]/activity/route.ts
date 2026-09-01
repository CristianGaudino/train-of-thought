import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getActivityByProject } from '@/lib/db/data';
import { getProjectAccess } from '@/lib/db/access';

interface Params {
    params: Promise<{ id: string }>;
}

export async function GET(_req: Request, { params }: Params) {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    try {
        const access = await getProjectAccess(id, userId);
        if (!access) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        const activity = await getActivityByProject(id);
        return NextResponse.json(activity);
    } catch (err) {
        console.error('[GET /api/projects/[id]/activity]', err);
        return NextResponse.json({ error: 'Failed to fetch activity' }, { status: 500 });
    }
}
