import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { renameSection, deleteSection } from '@/lib/db/actions';

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    try {
        const { title } = await req.json();
        await renameSection(id, title);
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('[PATCH /api/sections/[id]]', err);
        return NextResponse.json({ error: 'Failed to update section' }, { status: 500 });
    }
}

export async function DELETE(_req: Request, { params }: Params) {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    try {
        await deleteSection(id);
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('[DELETE /api/sections/[id]]', err);
        return NextResponse.json({ error: 'Failed to delete section' }, { status: 500 });
    }
}
