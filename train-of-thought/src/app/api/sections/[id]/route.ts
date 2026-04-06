import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { renameSection, deleteSection, createNotification } from '@/lib/db/actions';
import { db } from '@/lib/db';
import { sections, projects } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

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
        // Fetch section + project info before deleting for activity log
        let sectionTitle: string | null = null;
        let projectId:    string | null = null;
        let projectTitle: string | null = null;
        let projectAccent: string | null = null;

        try {
            const [section] = await db
                .select({ title: sections.title, projectId: sections.projectId })
                .from(sections)
                .where(eq(sections.id, id));

            if (section) {
                sectionTitle = section.title;
                projectId    = section.projectId;

                const [project] = await db
                    .select({ title: projects.title, accent: projects.accent })
                    .from(projects)
                    .where(eq(projects.id, section.projectId));

                if (project) {
                    projectTitle  = project.title;
                    projectAccent = project.accent;
                }
            }
        } catch { /* best-effort */ }

        await deleteSection(id);

        // Activity only — section deleted
        if (projectId && projectTitle && projectAccent && sectionTitle) {
            try {
                await createNotification({
                    userId,
                    type:          'project',
                    actorId:       userId,
                    projectId,
                    projectTitle,
                    projectAccent,
                    subject:       sectionTitle,
                    text:          'SECTION_DELETED',
                });
            } catch (notifErr) {
                console.error('[DELETE /api/sections/[id]] notification error:', notifErr);
            }
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('[DELETE /api/sections/[id]]', err);
        return NextResponse.json({ error: 'Failed to delete section' }, { status: 500 });
    }
}
