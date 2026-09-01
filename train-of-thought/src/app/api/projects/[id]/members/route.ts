import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { projects } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getProjectAccess } from '@/lib/db/access';
import {
    addProjectMember,
    removeProjectMember,
    createNotification,
} from '@/lib/db/actions';

interface Params {
    params: Promise<{ id: string }>;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ─── Share a project by email ─────────────────────────────────────────────────
// POST /api/projects/:id/members  { email: string }
// Looks the email up against Clerk. If no account exists we return 404 so the
// caller can surface a clear error. Otherwise the user is added to the project's
// members list and notified.

export async function POST(req: Request, { params }: Params) {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    try {
        const access = await getProjectAccess(id, userId);
        if (!access) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        const { email } = await req.json();
        const normalised = typeof email === 'string' ? email.trim().toLowerCase() : '';

        if (!normalised || !EMAIL_RE.test(normalised)) {
            return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
        }

        const client = await clerkClient();
        const { data: matches } = await client.users.getUserList({
            emailAddress: [normalised],
            limit:        1,
        });

        const target = matches[0];
        if (!target) {
            return NextResponse.json(
                { error: 'No Train of Thought account is registered to that email address.' },
                { status: 404 },
            );
        }

        if (target.id === access.ownerId) {
            return NextResponse.json(
                { error: 'That person owns this project.' },
                { status: 409 },
            );
        }
        if (access.members.includes(target.id)) {
            return NextResponse.json(
                { error: 'That person is already on this project.' },
                { status: 409 },
            );
        }

        const members = await addProjectMember(id, target.id);

        // Notify the newly added member + drop an activity row for the actor
        try {
            const [project] = await db
                .select({ title: projects.title, accent: projects.accent })
                .from(projects)
                .where(eq(projects.id, id));

            if (project) {
                await Promise.allSettled(
                    [target.id, userId].map(recipientId =>
                        createNotification({
                            userId:        recipientId,
                            type:          'project',
                            actorId:       userId,
                            projectId:     id,
                            projectTitle:  project.title,
                            projectAccent: project.accent,
                            subject:       project.title,
                            text:          'MEMBER_ADDED',
                        })
                    )
                );
            }
        } catch (notifErr) {
            console.error('[POST /api/projects/[id]/members] notification error:', notifErr);
        }

        const member = {
            id:       target.id,
            name:     target.fullName ?? target.firstName ?? target.emailAddresses[0]?.emailAddress ?? 'Unknown',
            initials: ((target.firstName?.[0] ?? '') + (target.lastName?.[0] ?? '')).toUpperCase() || '?',
            email:    target.emailAddresses[0]?.emailAddress ?? normalised,
            imageUrl: target.imageUrl || undefined,
        };

        return NextResponse.json({ member, members }, { status: 201 });
    } catch (err) {
        console.error('[POST /api/projects/[id]/members]', err);
        return NextResponse.json({ error: 'Failed to share project' }, { status: 500 });
    }
}

// ─── Remove a member / leave a project ────────────────────────────────────────
// DELETE /api/projects/:id/members?userId=<id>
// The owner can remove anyone; a member can only remove themselves (leave).

export async function DELETE(req: Request, { params }: Params) {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    try {
        const access = await getProjectAccess(id, userId);
        if (!access) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        const url      = new URL(req.url);
        const targetId = url.searchParams.get('userId') ?? userId;

        if (targetId === access.ownerId) {
            return NextResponse.json(
                { error: 'The project owner cannot be removed.' },
                { status: 400 },
            );
        }

        if (access.role !== 'owner' && targetId !== userId) {
            return NextResponse.json(
                { error: 'Only the owner can remove other members.' },
                { status: 403 },
            );
        }

        const members = await removeProjectMember(id, targetId);
        return NextResponse.json({ members });
    } catch (err) {
        console.error('[DELETE /api/projects/[id]/members]', err);
        return NextResponse.json({ error: 'Failed to update members' }, { status: 500 });
    }
}
