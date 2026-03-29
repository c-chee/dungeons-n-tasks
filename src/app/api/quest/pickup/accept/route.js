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

        const [quest] = await pool.query(
            'SELECT * FROM Quests WHERE id = ?',
            [request[0].quest_id]
        );

        if (!quest.length) {
            return NextResponse.json({ error: 'Quest not found' }, { status: 404 });
        }

        if (quest[0].status !== 'available') {
            return NextResponse.json({ error: 'Quest is no longer available' }, { status: 400 });
        }

        await pool.query(
            'UPDATE Quests SET assigned_to = ?, status = "assigned" WHERE id = ?',
            [request[0].user_id, request[0].quest_id]
        );

        await pool.query(
            'UPDATE QuestPickupRequests SET status = "accepted" WHERE id = ?',
            [requestId]
        );

        await pool.query(
            'DELETE FROM QuestPickupRequests WHERE quest_id = ? AND status = "pending" AND id != ?',
            [request[0].quest_id, requestId]
        );

        return NextResponse.json({ success: true });

    } catch (err) {
        console.log('Accept pickup request error:', err);
        return NextResponse.json({ error: 'Failed to accept pickup request' }, { status: 500 });
    }
}
