import pool from '@/lib/db';
import { getUserFromToken } from '@/lib/getUserFromToken';

export async function POST(req) {
    const user = await getUserFromToken(req);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const {
            title,
            description,
            context_type, // 'guild' or 'party'
            guild_id,
            party_id,
            reward_coins = 10,
            reward_xp = 10,
            assigned_to = null, // optional
        } = await req.json();

        // Validate required fields
        if (!title || !description) {
            return Response.json({ error: 'Title and description are required' }, { status: 400 });
        }

        if (context_type === 'guild' && !guild_id) {
            return Response.json({ error: 'guild_id is required for guild quests' }, { status: 400 });
        }
        if (context_type === 'party' && !party_id) {
            return Response.json({ error: 'party_id is required for party quests' }, { status: 400 });
        }

        // Insert quest
        const [result] = await pool.query(
            `INSERT INTO Quests 
            (title, description, created_by, context_type, guild_id, party_id, reward_coins, reward_xp, assigned_to)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [title, description, user.id, context_type, guild_id || null, party_id || null, reward_coins, reward_xp, assigned_to]
        );

        return Response.json({ success: true, questId: result.insertId });
    } catch (err) {
        console.error('Error creating quest:', err);
        return Response.json({ error: 'Failed to create quest' }, { status: 500 });
    }
}