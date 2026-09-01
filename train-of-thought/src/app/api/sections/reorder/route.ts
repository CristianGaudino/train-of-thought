import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { reorderSections } from '@/lib/db/actions';
import { hasAccessToAllSectionProjects } from '@/lib/db/access';

export async function POST(req: Request) {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const updates: { id: string; order: number }[] = await req.json();

        const allowed = await hasAccessToAllSectionProjects(updates.map(u => u.id), userId);
        if (!allowed) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        await reorderSections(updates);
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('[POST /api/sections/reorder]', err);
        return NextResponse.json({ error: 'Failed to reorder sections' }, { status: 500 });
    }
}
