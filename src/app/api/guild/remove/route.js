// For guild master
// /api/guild/remove.js
import pool from '@/lib/db';
import { getUserFromToken } from '@/lib/getUserFromToken';

export async function POST(req) {
    try {
        const user = await getUserFromToken(req);
        if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        const { guildId, memberId } = await req.json();

        // Check if requester is guild master
        const [rows] = await pool.query(
            'SELECT role FROM GuildMembers WHERE guild_id = ? AND user_id = ?',
            [guildId, user.id]
        );

        if (!rows.length || rows[0].role !== 'guild_master') return Response.json({ error: 'Forbidden' }, { status: 403 });

        // Remove member
        await pool.query('DELETE FROM GuildMembers WHERE guild_id = ? AND user_id = ?', [guildId, memberId]);

        return Response.json({ success: true });

    } catch (err) {
        console.error(err);
        return Response.json({ error: 'Server error' }, { status: 500 });
    }
}