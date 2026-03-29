import pool from '@/lib/db';
import { getUserFromToken } from '@/lib/getUserFromToken';
import { NextResponse } from 'next/server';

export async function POST(req) {
    const user = await getUserFromToken();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { requestId } = await req.json();

        const [request] = await pool.query(
            'SELECT * FROM QuestPickupRequests WHERE id = ?',
            [requestId]
        );

        if (!request.length) {
            return NextResponse.json({ error: 'Request not found' }, { status: 404 });
        }

        if (request[0].status !== 'pending') {
            return NextResponse.json({ error: 'Request is not pending' }, { status: 400 });
        }

        await pool.query(
            'UPDATE QuestPickupRequests SET status = "declined" WHERE id = ?',
            [requestId]
        );

        await pool.query(
            'DELETE FROM QuestPickupRequests WHERE id = ?',
            [requestId]
        );

        return NextResponse.json({ success: true });

    } catch (err) {
        console.log('Decline pickup request error:', err);
        return NextResponse.json({ error: 'Failed to decline pickup request' }, { status: 500 });
    }
}
