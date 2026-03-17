import { markAllNotificationsRead, markNotificationRead } from '@/lib/db/actions';
import { getNotificationsByUser } from '@/lib/db/data';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET() {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const data = await getNotificationsByUser(userId);
        return NextResponse.json(data);
    } catch (err) {
        console.error('[GET /api/notifications]', err);
        return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await req.json();

        // PATCH { all: true } marks everything read
        // PATCH { id: "n123" } marks one read
        if (body.all === true) {
            await markAllNotificationsRead(userId);
        } else if (body.id) {
            await markNotificationRead(body.id, userId);
        } else {
            return NextResponse.json({ error: 'Provide id or all:true' }, { status: 400 });
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('[PATCH /api/notifications]', err);
        return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 });
    }
}
