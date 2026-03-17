import { createProject } from '@/lib/db/actions';
import { getProjectsByUser } from '@/lib/db/data';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET() {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const data = await getProjectsByUser(userId);
        return NextResponse.json(data);
    } catch (err) {
        console.error('[GET /api/projects]', err);
        return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await req.json();
        const { title, description, status, deadline, accent, color, tags, members } = body;

        if (!title?.trim()) {
            return NextResponse.json({ error: 'Title is required' }, { status: 400 });
        }

        const project = await createProject(userId, {
            title:       title.trim(),
            description: description?.trim() ?? '',
            status:      status ?? 'Planning',
            deadline:    deadline ?? null,
            accent:      accent ?? '#2D7A5F',
            color:       color  ?? '#E8F4F0',
            tags:        tags   ?? [],
            members:     members ?? [userId],
        });

        return NextResponse.json(project, { status: 201 });
    } catch (err) {
        console.error('[POST /api/projects]', err);
        return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
    }
}
