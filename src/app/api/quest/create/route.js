import pool from '@/lib/db';
import { getUserFromToken } from '@/lib/getUserFromToken';
import { NextResponse } from 'next/server';

export async function POST(req) {
    const user = await getUserFromToken();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const {
            title,
            description,
            context_type,
            party_id,
            reward_coins = 10,
            reward_xp = 10,
            assigned_to = null
        } = await req.json();

        const guild_id = context_type === 'guild' ? user.guild?.guild_id : null;

        if (context_type === 'guild' && !guild_id) {
            return NextResponse.json({ error: 'Guild ID required for guild quests' }, { status: 400 });
        }

        const status = assigned_to ? 'assigned' : 'available';

        const [result] = await pool.query(
            `INSERT INTO Quests
            (title, description, created_by, context_type, guild_id, party_id, reward_coins, reward_xp, assigned_to, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                title,
                description,
                user.id,
                context_type,
                guild_id,
                party_id || null,
                reward_coins,
                reward_xp,
                assigned_to || null,
                status
            ]
        );

        return NextResponse.json({ success: true, id: result.insertId });
    } catch (err) {
        console.error('Create quest error:', err);
        return NextResponse.json({ error: 'Failed to create quest' }, { status: 500 });
    }
}