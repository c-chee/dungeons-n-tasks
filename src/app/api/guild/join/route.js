import pool from '@/lib/db';
import { getUserFromToken } from '@/lib/getUserFromToken';
import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        const user = await getUserFromToken();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { joinCode } = await req.json();

        const [guildRows] = await pool.query('SELECT id FROM Guilds WHERE join_code = ?', [joinCode]);
        if (!guildRows.length) return NextResponse.json({ error: 'Invalid join code' }, { status: 404 });

        const guildId = guildRows[0].id;

        const [existing] = await pool.query('SELECT * FROM GuildMembers WHERE user_id = ? AND guild_id = ?', [user.id, guildId]);
        if (existing.length) return NextResponse.json({ error: 'Already in guild or pending' }, { status: 400 });

        await pool.query('INSERT INTO GuildMembers (guild_id, user_id, role, status) VALUES (?, ?, ?, ?)', [guildId, user.id, 'member', 'pending']);

        return NextResponse.json({ success: true, message: 'Join request sent' });

    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}