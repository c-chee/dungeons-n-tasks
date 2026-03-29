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

        const [quest] = await pool.query(
            `SELECT * FROM Quests WHERE id = ? AND assigned_to = ?`,
            [questId, user.id]
        );

        if (!quest.length) {
            return NextResponse.json({ error: 'Quest not found or not assigned to you' }, { status: 404 });
        }

        if (quest[0].status !== 'assigned') {
            return NextResponse.json({ error: 'Quest is not currently assigned' }, { status: 400 });
        }

        await pool.query(
            `UPDATE Quests SET assigned_to = NULL, status = 'available' WHERE id = ?`,
            [questId]
        );

        return NextResponse.json({ success: true });

    } catch (err) {
        console.log('Abandon quest error:', err);
        return NextResponse.json({ error: 'Failed to abandon quest' }, { status: 500 });
    }
}
