import pool from '@/lib/db';
import { getUserFromToken } from '@/lib/getUserFromToken';
import { NextResponse } from 'next/server';

export async function POST(req) {
    const user = await getUserFromToken();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { questId } = await req.json();

    const [quest] = await pool.query(
        'SELECT * FROM Quests WHERE id = ?',
        [questId]
    );

    if (!quest.length) {
        return NextResponse.json({ error: 'Quest not found' }, { status: 404 });
    }

    if (quest[0].status !== 'available') {
        return NextResponse.json({ error: 'Quest is not available' }, { status: 400 });
    }

    if (quest[0].assigned_to) {
        return NextResponse.json({ error: 'Quest is already assigned' }, { status: 400 });
    }

    await pool.query(
        `UPDATE Quests
        SET assigned_to = ?, status = 'assigned'
        WHERE id = ? AND status = 'available'`,
        [user.id, questId]
    );

    return NextResponse.json({ success: true });
}
