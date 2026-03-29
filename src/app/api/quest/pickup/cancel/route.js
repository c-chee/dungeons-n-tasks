import pool from '@/lib/db';
import { getUserFromToken } from '@/lib/getUserFromToken';
import { NextResponse } from 'next/server';

export async function POST(req) {
    const user = await getUserFromToken();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { questId } = await req.json();

        const [request] = await pool.query(
            'SELECT * FROM QuestPickupRequests WHERE quest_id = ? AND user_id = ? AND status = "pending"',
            [questId, user.id]
        );

        if (!request.length) {
            return NextResponse.json({ error: 'Request not found' }, { status: 404 });
        }

        await pool.query(
            'DELETE FROM QuestPickupRequests WHERE quest_id = ? AND user_id = ? AND status = "pending"',
            [questId, user.id]
        );

        return NextResponse.json({ success: true });

    } catch (err) {
        console.log('Cancel pickup request error:', err);
        return NextResponse.json({ error: 'Failed to cancel pickup request' }, { status: 500 });
    }
}
