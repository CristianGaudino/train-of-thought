import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { Member } from '@/lib/projects/definitions';

function idToColor(id: string): string {
    const colors = [
        '#2D7A5F', '#3A5FA0', '#A0714F', '#8A4FA0',
        '#C45C3A', '#4A8A6E', '#6B5EA0', '#A05C7A',
    ];
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = ((hash << 5) - hash) + id.charCodeAt(i);
        hash |= 0;
    }
    return colors[Math.abs(hash) % colors.length];
}

function getInitials(firstName?: string | null, lastName?: string | null): string {
    return ((firstName?.[0] ?? '') + (lastName?.[0] ?? '')).toUpperCase() || '?';
}

export async function GET(req: Request) {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const url = new URL(req.url);
    const ids = url.searchParams.get('ids')?.split(',').filter(Boolean) ?? [];

    if (ids.length === 0) return NextResponse.json([]);

    try {
        const client = await clerkClient();
        const { data: users } = await client.users.getUserList({ userId: ids, limit: ids.length });

        const members: Member[] = users.map(u => ({
            id:       u.id,
            name:     u.fullName ?? u.firstName ?? u.emailAddresses[0]?.emailAddress ?? 'Unknown',
            initials: getInitials(u.firstName, u.lastName),
            color:    idToColor(u.id),
            imageUrl: u.imageUrl || undefined,
        }));

        return NextResponse.json(members);
    } catch (err) {
        console.error('[GET /api/users]', err);
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}
