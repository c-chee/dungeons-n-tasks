import pool from '@/lib/db';
import { getUserFromToken } from '@/lib/getUserFromToken';

export async function POST(req) {
    try {
        const user = await getUserFromToken(); // ✅ FIXED

        if (!user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { title, description, context_type, guild_id, party_id } = await req.json();

        if (!title || !description) {
        return Response.json({ error: 'Missing title/description' }, { status: 400 });
        }

        const finalGuildId = context_type === 'guild'
        ? (guild_id || user.guild?.guild_id)
        : null;

        const finalPartyId = context_type === 'party'
        ? party_id
        : null;

        if (context_type === 'guild' && !finalGuildId) {
        return Response.json({ error: 'Missing guild_id' }, { status: 400 });
        }

        await pool.query(
        `INSERT INTO Quests 
        (title, description, created_by, context_type, guild_id, party_id)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [title, description, user.id, context_type, finalGuildId, finalPartyId]
        );

        return Response.json({ success: true });

    } catch (err) {
        console.error('CREATE QUEST ERROR:', err);
        return Response.json({ error: err.message }, { status: 500 });
    }
}