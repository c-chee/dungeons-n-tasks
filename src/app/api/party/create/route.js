import pool from '@/lib/db';
import { getUserFromToken } from '@/lib/getUserFromToken';
import { NextResponse } from 'next/server';

export async function POST(req) {
    const user = await getUserFromToken();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { name, guildId, memberIds = [], leaderId = null } = await req.json();

        console.log('Create party request:', { name, guildId, memberIds, leaderId });
        console.log('User info:', user);

        if (!user?.guild || user.guild.role !== 'guild_master') {
            return NextResponse.json({ error: 'Only guild masters can create parties' }, { status: 403 });
        }

        if (!name?.trim()) {
            return NextResponse.json({ error: 'Party name is required' }, { status: 400 });
        }

        if (memberIds.length > 15) {
            return NextResponse.json({ error: 'Maximum 15 members per party' }, { status: 400 });
        }

        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            const [result] = await connection.query(
                `INSERT INTO Parties (name, guild_id, owner_id, leader_id) VALUES (?, ?, ?, ?)`,
                [name.trim(), guildId, user.id, leaderId]
            );

            const partyId = result.insertId;

            for (const memberId of memberIds) {
                const role = memberId === leaderId ? 'leader' : 'member';
                await connection.query(
                    `INSERT INTO PartyMembers (party_id, user_id, role, status) VALUES (?, ?, ?, 'approved')`,
                    [partyId, memberId, role]
                );
            }

            if (leaderId && !memberIds.includes(leaderId)) {
                await connection.query(
                    `INSERT INTO PartyMembers (party_id, user_id, role, status) VALUES (?, ?, 'leader', 'approved')`,
                    [partyId, leaderId]
                );
            }

            await connection.commit();
            connection.release();

            return NextResponse.json({ 
                success: true, 
                partyId,
                message: 'Party created successfully' 
            });

        } catch (err) {
            await connection.rollback();
            connection.release();
            console.log('Transaction error:', err);
            throw err;
        }

    } catch (err) {
        console.log('Create party error:', err);
        return NextResponse.json({ error: err.message || 'Failed to create party' }, { status: 500 });
    }
}
