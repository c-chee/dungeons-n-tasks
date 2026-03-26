import pool from '@/lib/db';
import { getUserFromToken } from '@/lib/getUserFromToken';

export async function POST(req) {
    try {
        const user = await getUserFromToken(req);
        if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        const { joinCode } = await req.json();

        // Find guild by join code
        const [guildRows] = await pool.query('SELECT id FROM Guilds WHERE join_code = ?', [joinCode]);
        if (!guildRows.length) return Response.json({ error: 'Invalid join code' }, { status: 404 });

        const guildId = guildRows[0].id;

        // Check if user is already in guild
        const [existing] = await pool.query('SELECT * FROM GuildMembers WHERE user_id = ? AND guild_id = ?', [user.id, guildId]);
        if (existing.length) return Response.json({ error: 'Already in guild or pending' }, { status: 400 });

        // Insert join request (pending)
        await pool.query('INSERT INTO GuildMembers (guild_id, user_id, role, status) VALUES (?, ?, ?, ?)', [guildId, user.id, 'member', 'pending']);

        return Response.json({ success: true, message: 'Join request sent' });

    } catch (err) {
        console.error(err);
        return Response.json({ error: 'Server error' }, { status: 500 });
    }
}