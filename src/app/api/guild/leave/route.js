// /api/guild/leave.js
import pool from '@/lib/db';
import { getUserFromToken } from '@/lib/getUserFromToken';

export async function POST(req) {
    try {
        const user = await getUserFromToken();
        if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        const { guildId } = await req.json();

        // Prevent guild master from leaving without transferring ownership
        const [rows] = await pool.query(
            'SELECT role FROM GuildMembers WHERE guild_id = ? AND user_id = ?',
            [guildId, user.id]
        );

        if (!rows.length) return Response.json({ error: 'Not in guild' }, { status: 400 });
        if (rows[0].role === 'guild_master') return Response.json({ error: 'Guild master cannot leave' }, { status: 403 });

        await pool.query('DELETE FROM GuildMembers WHERE guild_id = ? AND user_id = ?', [guildId, user.id]);

        return Response.json({ success: true });

    } catch (err) {
        console.error(err);
        return Response.json({ error: 'Server error' }, { status: 500 });
    }
}