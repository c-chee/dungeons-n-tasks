import pool from '@/lib/db';
import { getUserFromToken } from '@/lib/getUserFromToken';

export async function POST(req) {
    const user = getUserFromToken();

    const { questId, targetUserId } = await req.json();

    // 🔒 Ensure user is guild master of this quest
    const [rows] = await pool.query(
        `SELECT gm.role 
        FROM Quests q
        JOIN GuildMembers gm ON gm.guild_id = q.guild_id
        WHERE q.id = ? AND gm.user_id = ?`,
        [questId, user.id]
    );

    if (!rows.length || rows[0].role !== 'guild_master') {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    await pool.query(
        `UPDATE Quests 
        SET assigned_to = ?, status = 'assigned'
        WHERE id = ?`,
        [targetUserId, questId]
    );

    return Response.json({ success: true });
}