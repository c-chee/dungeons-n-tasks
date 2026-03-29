import pool from '@/lib/db';
import { getUserFromToken } from '@/lib/getUserFromToken';
import { NextResponse } from 'next/server';

export async function POST(req) {
    const user = await getUserFromToken();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!user.guild || user.guild.role !== 'guild_master') {
        return NextResponse.json({ error: 'Only guild masters can revise quests' }, { status: 403 });
    }

    try {
        const { questId, revision_note } = await req.json();

        const [quest] = await pool.query(
            `SELECT * FROM Quests WHERE id = ? AND context_type = 'guild' AND guild_id = ?`,
            [questId, user.guild.guild_id]
        );

        if (!quest.length) {
            return NextResponse.json({ error: 'Quest not found' }, { status: 404 });
        }

        if (quest[0].status !== 'pending_review') {
            return NextResponse.json({ error: 'Quest is not pending review' }, { status: 400 });
        }

        await pool.query(
            `UPDATE Quests SET status = 'in_progress', revision_note = ? WHERE id = ?`,
            [revision_note || null, questId]
        );

        return NextResponse.json({ success: true });

    } catch (err) {
        console.log('Revise quest error:', err);
        return NextResponse.json({ error: 'Failed to revise quest' }, { status: 500 });
    }
}
