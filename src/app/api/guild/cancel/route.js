import pool from '@/lib/db';
import { getUserFromToken } from '@/lib/getUserFromToken';

export async function POST(req) {
    try {
        const user = await getUserFromToken(req);
        if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        const { guildId } = await req.json();

        await pool.query(
            `DELETE FROM GuildMembers 
             WHERE user_id = ? AND guild_id = ? AND status = 'pending'`,
            [user.id, guildId]
        );

        return Response.json({ success: true });

    } catch (err) {
        console.error(err);
        return Response.json({ error: 'Server error' }, { status: 500 });
    }
}
