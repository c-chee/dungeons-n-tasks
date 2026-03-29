import pool from '@/lib/db';
import { getUserFromToken } from '@/lib/getUserFromToken';

function generateJoinCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

export async function POST(req) {
    try {
        const user = await getUserFromToken();
        if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        const { guildId } = await req.json();

        const [rows] = await pool.query(
            `SELECT role FROM GuildMembers 
             WHERE user_id = ? AND guild_id = ? AND status = 'approved'`,
            [user.id, guildId]
        );

        if (!rows.length || rows[0].role !== 'guild_master') {
            return Response.json({ error: 'Forbidden' }, { status: 403 });
        }

        const newCode = generateJoinCode();
        await pool.query(
            `UPDATE Guilds SET join_code = ? WHERE id = ?`,
            [newCode, guildId]
        );

        return Response.json({ success: true, joinCode: newCode });

    } catch (err) {
        console.error(err);
        return Response.json({ error: 'Server error' }, { status: 500 });
    }
}
