import { deleteProject, updateProject } from '@/lib/db/actions';
import { getProjectById } from '@/lib/db/data';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

interface Params {
    params: Promise<{ id: string }>;
}

export async function GET(_req: Request, { params }: Params) {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    try {
        const project = await getProjectById(id, userId);
        if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json(project);
    } catch (err) {
        console.error('[GET /api/projects/[id]]', err);
        return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 });
    }
}

export async function PATCH(req: Request, { params }: Params) {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    try {
        const body = await req.json();
        await updateProject(id, userId, body);
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('[PATCH /api/projects/[id]]', err);
        return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
    }
}

export async function DELETE(_req: Request, { params }: Params) {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    try {
        await deleteProject(id, userId);
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('[DELETE /api/projects/[id]]', err);
        return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
    }
}
