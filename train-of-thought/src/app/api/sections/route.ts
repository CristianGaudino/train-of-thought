import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createSection, createNotification } from '@/lib/db/actions';
import { getProjectAccess } from '@/lib/db/access';
import { db } from '@/lib/db';
import { projects } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { projectId, title, order } = await req.json();

        if (!projectId || !title?.trim()) {
            return NextResponse.json({ error: 'projectId and title are required' }, { status: 400 });
        }

        const access = await getProjectAccess(projectId, userId);
        if (!access) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        const id = await createSection(projectId, title, order ?? 0);

        // Activity only — section created
        try {
            const [project] = await db
                .select({ title: projects.title, accent: projects.accent })
                .from(projects)
                .where(eq(projects.id, projectId));

            if (project) {
                await createNotification({
                    userId:        'activity',
                    type:          'project',
                    actorId:       userId,
                    projectId,
                    projectTitle:  project.title,
                    projectAccent: project.accent,
                    subject:       title,
                    text:          'SECTION_CREATED',
                });
            }
        } catch (notifErr) {
            console.error('[POST /api/sections] notification error:', notifErr);
        }

        return NextResponse.json({ id }, { status: 201 });
    } catch (err) {
        console.error('[POST /api/sections]', err);
        return NextResponse.json({ error: 'Failed to create section' }, { status: 500 });
    }
}