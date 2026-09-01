import { deleteProject, updateProject, createNotification } from '@/lib/db/actions';
import { getProjectById } from '@/lib/db/data';
import { getProjectAccess } from '@/lib/db/access';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { projects } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

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

        // Owner or member may edit everything about the project (not delete it)
        const access = await getProjectAccess(id, userId);
        if (!access) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        // Fetch current state before updating so we can detect meaningful changes
        const [current] = await db
            .select({
                title:    projects.title,
                status:   projects.status,
                deadline: projects.deadline,
                accent:   projects.accent,
                members:  projects.members,
            })
            .from(projects)
            .where(eq(projects.id, id));

        if (!current) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        // The owner is implicit and can never be removed from the members list
        if (body.members !== undefined && Array.isArray(body.members)) {
            body.members = [...new Set([...body.members, access.ownerId])];
        }

        await updateProject(id, body);

        try {
            const { title: projectTitle, accent: projectAccent, members } = current;
            const allMembers = members ?? [];

            if (body.title !== undefined && body.title !== current.title) {
                // Activity only — project renamed
                await createNotification({
                    userId,
                    type:          'project',
                    actorId:       userId,
                    projectId:     id,
                    projectTitle,
                    projectAccent,
                    subject:       body.title,
                    text:          'PROJECT_RENAMED',
                });
            }

            if (body.status !== undefined && body.status !== current.status) {
                // Activity only — status changed
                await createNotification({
                    userId,
                    type:          'project',
                    actorId:       userId,
                    projectId:     id,
                    projectTitle,
                    projectAccent,
                    subject:       projectTitle,
                    text:          'PROJECT_STATUS_CHANGED',
                });
            }

            if (body.deadline !== undefined) {
                const currentDeadline = current.deadline
                    ? current.deadline.toISOString().split('T')[0]
                    : '';
                if (body.deadline !== currentDeadline) {
                    // Activity + notify all members except actor
                    const recipients = [userId, ...allMembers.filter((mid: string) => mid !== userId)];
                    await Promise.allSettled(
                        recipients.map((recipientId: string) =>
                            createNotification({
                                userId:        recipientId,
                                type:          'project',
                                actorId:       userId,
                                projectId:     id,
                                projectTitle,
                                projectAccent,
                                subject:       projectTitle,
                                text:          'PROJECT_DEADLINE_CHANGED',
                            })
                        )
                    );
                }
            }

            if (body.members !== undefined) {
                const newMembers = (body.members as string[]).filter(
                    (mid: string) => !allMembers.includes(mid)
                );
                if (newMembers.length > 0) {
                    // Activity row for actor + notify each newly added member
                    const recipients = [userId, ...newMembers.filter((mid: string) => mid !== userId)];
                    await Promise.allSettled(
                        recipients.map((recipientId: string) =>
                            createNotification({
                                userId:        recipientId,
                                type:          'project',
                                actorId:       userId,
                                projectId:     id,
                                projectTitle,
                                projectAccent,
                                subject:       projectTitle,
                                text:          'MEMBER_ADDED',
                            })
                        )
                    );
                }
            }
        } catch (notifErr) {
            console.error('[PATCH /api/projects/[id]] notification error:', notifErr);
        }

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
        const access = await getProjectAccess(id, userId);
        if (!access) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        if (access.role !== 'owner') {
            return NextResponse.json(
                { error: 'Only the project owner can delete this project.' },
                { status: 403 },
            );
        }

        await deleteProject(id, userId);
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('[DELETE /api/projects/[id]]', err);
        return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
    }
}
