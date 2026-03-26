import pool from '@/lib/db';
import { getUserFromToken } from '@/lib/getUserFromToken';

export async function POST(req) {
    const user = getUserFromToken();

    if (!user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
        title,
        description,
        context_type,
        guild_id,
        party_id
    } = await req.json();

    await pool.query(
        `INSERT INTO Quests 
        (title, description, created_by, context_type, guild_id, party_id)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [title, description, user.id, context_type, guild_id, party_id]
    );

    return Response.json({ success: true });
}