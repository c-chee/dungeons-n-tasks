import pool from '@/lib/db';
import { getUserFromToken } from '@/lib/getUserFromToken';

export async function POST(req) {
    const user = getUserFromToken();

    if (!user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { questId } = await req.json();

    // Assign quest to user
    await pool.query(
        `UPDATE Quests
        SET assigned_to = ?, status = 'assigned'
        WHERE id = ? AND status = 'available'`,
        [user.id, questId]
    );

    return Response.json({ success: true });
    }import pool from '@/lib/db';
    import { getUserFromToken } from '@/lib/getUserFromToken';

    export async function POST(req) {
    const user = getUserFromToken();

    if (!user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { questId } = await req.json();

    // Assign quest to user
    await pool.query(
        `UPDATE Quests
        SET assigned_to = ?, status = 'assigned'
        WHERE id = ? AND status = 'available'`,
        [user.id, questId]
    );

    return Response.json({ success: true });
}