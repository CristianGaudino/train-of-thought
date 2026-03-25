import { deleteProject, updateProject, createNotification } from '@/lib/db/actions';
import { getProjectById } from '@/lib/db/data';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { projects } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';

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
            .where(and(eq(projects.id, id), eq(projects.userId, userId)));

        if (!current) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        await updateProject(id, userId, body);

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
                    text:          'renamed project to',
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
                    text:          `set status to ${body.status} on`,
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
                                text:          'updated deadline on',
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
                                text:          'added you to',
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
        await deleteProject(id, userId);
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('[DELETE /api/projects/[id]]', err);
        return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
    }
}
