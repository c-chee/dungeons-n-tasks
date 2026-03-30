import pool from '@/lib/db';
import { getUserFromToken } from '@/lib/getUserFromToken';
import { NextResponse } from 'next/server';

export async function POST(req) {
    const user = await getUserFromToken();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!user.guild || user.guild.role !== 'guild_master') {
        return NextResponse.json({ error: 'Only guild masters can update quests' }, { status: 403 });
    }

    try {
        const { questId, title, description, reward_coins, reward_xp, assigned_to, context_type, party_id } = await req.json();

        const [quest] = await pool.query(
            `SELECT * FROM Quests WHERE id = ? AND ((context_type = 'guild' AND guild_id = ?) OR (context_type = 'party'))`,
            [questId, user.guild.guild_id]
        );

        if (!quest.length) {
            return NextResponse.json({ error: 'Quest not found or access denied' }, { status: 404 });
        }

        if (quest[0].status === 'completed') {
            return NextResponse.json({ error: 'Cannot edit completed quests' }, { status: 400 });
        }

        const isPartyQuest = context_type === 'party';
        const newStatus = isPartyQuest ? 'available' : (assigned_to ? 'assigned' : 'available');
        const newGuildId = isPartyQuest ? null : user.guild.guild_id;

        await pool.query(
            `UPDATE Quests 
             SET title = COALESCE(?, title),
                 description = COALESCE(?, description),
                 reward_coins = COALESCE(?, reward_coins),
                 reward_xp = COALESCE(?, reward_xp),
                 assigned_to = ?,
                 context_type = COALESCE(?, context_type),
                 party_id = ?,
                 guild_id = ?,
                 status = ?
             WHERE id = ?`,
            [title, description, reward_coins, reward_xp, assigned_to, context_type, party_id, newGuildId, newStatus, questId]
        );

        return NextResponse.json({ success: true });

    } catch (err) {
        console.log('Update quest error:', err);
        return NextResponse.json({ error: 'Failed to update quest' }, { status: 500 });
    }
}
