import pool from '@/lib/db';
import { getUserFromToken } from '@/lib/getUserFromToken';

export async function POST(req) {
    const user = await getUserFromToken(req);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { questId } = await req.json();
    const [result] = await pool.query(
        `UPDATE Quests
         SET assigned_to = ?, status = 'assigned'
         WHERE id = ? AND status = 'available'`,
        [user.id, questId]
    );

    if (result.affectedRows === 0) {
        return Response.json({ error: 'Quest not available' }, { status: 400 });
    }

    return Response.json({ success: true });
}