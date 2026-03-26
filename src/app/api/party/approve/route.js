import pool from '@/lib/db';
import { getUserFromToken } from '@/lib/getUserFromToken';

export async function POST(req) {
    const user = getUserFromToken();

    if (!user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, partyId } = await req.json();

    // Check if requester is party leader
    const [rows] = await pool.query(
        `SELECT role FROM PartyMembers 
        WHERE user_id = ? AND party_id = ? AND status = 'approved'`,
        [user.id, partyId]
    );

    if (!rows.length || rows[0].role !== 'leader') {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Await to approve req
    await pool.query(
        `UPDATE PartyMembers 
        SET status = 'approved'
        WHERE user_id = ? AND party_id = ?`,
        [userId, partyId]
    );

    return Response.json({ success: true });
}