import pool from '@/lib/db';
import { getUserFromToken } from '@/lib/getUserFromToken';
import { NextResponse } from 'next/server';

export async function GET(req) {
    const user = await getUserFromToken();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const [guildMembership] = await pool.query(
            'SELECT guild_id, role FROM GuildMembers WHERE user_id = ? AND status = "approved"',
            [user.id]
        );

        if (!guildMembership.length) {
            return NextResponse.json({ error: 'Not a guild member' }, { status: 403 });
        }

        const guildId = guildMembership[0].guild_id;
        const isGuildMaster = guildMembership[0].role === 'guild_master';

        const [requests] = await pool.query(
            `SELECT 
                qpr.id,
                qpr.quest_id,
                qpr.user_id,
                qpr.guild_id,
                qpr.status,
                qpr.created_at,
                q.title as quest_title,
                q.guild_id as quest_guild_id,
                u.first_name,
                u.last_name,
                u.level as user_level
             FROM QuestPickupRequests qpr
             JOIN Quests q ON q.id = qpr.quest_id
             JOIN Users u ON u.id = qpr.user_id
             WHERE q.guild_id = ? AND qpr.status = 'pending'
             ORDER BY qpr.created_at DESC`,
            [guildId]
        );

        return NextResponse.json(requests);

    } catch (err) {
        console.log('Get pickup requests error:', err);
        return NextResponse.json({ error: 'Failed to get pickup requests' }, { status: 500 });
    }
}
