import pool from '@/lib/db';
import { getUserFromToken } from '@/lib/getUserFromToken';

export async function POST(req) {
    try {
        const user = await getUserFromToken(req);

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { userId, guildId } = await req.json();

        const [rows] = await pool.query(
            `SELECT role FROM GuildMembers 
            WHERE user_id = ? AND guild_id = ? AND status = 'approved'`,
            [user.id, guildId]
        );

        if (!rows.length || rows[0].role !== 'guild_master') {
            return Response.json({ error: 'Forbidden' }, { status: 403 });
        }

        await pool.query(
            `UPDATE GuildMembers 
            SET status = 'approved'
            WHERE user_id = ? AND guild_id = ?`,
            [userId, guildId]
        );

        return Response.json({ success: true });

    } catch (err) {
        console.error('API ERROR:', err);
        return Response.json({ error: 'Server error' }, { status: 500 });
    }
}