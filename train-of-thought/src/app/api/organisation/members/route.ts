import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET() {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const client = await clerkClient();
        const { data: users } = await client.users.getUserList({ limit: 100 });
        return NextResponse.json(users.map(u => u.id));
    } catch (err) {
        console.error('[GET /api/organisation/members]', err);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
