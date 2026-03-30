import pool from '@/lib/db';
import { getUserFromToken } from '@/lib/getUserFromToken';
import { NextResponse } from 'next/server';

export async function GET(req) {
    const user = await getUserFromToken();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const guildId = searchParams.get('guildId');

        if (!guildId) {
            return NextResponse.json({ error: 'Guild ID required' }, { status: 400 });
        }

        const [members] = await pool.query(
            `SELECT 
                pm.party_id,
                pm.user_id,
                pm.role,
                pm.status,
                u.first_name,
                u.last_name,
                u.level
             FROM PartyMembers pm
             JOIN Users u ON pm.user_id = u.id
             JOIN Parties p ON pm.party_id = p.id
             WHERE p.guild_id = ? AND pm.status = 'approved'
             ORDER BY pm.party_id, pm.role DESC`,
            [guildId]
        );

        const [parties] = await pool.query(
            `SELECT p.*, 
                leader.first_name as leader_first_name,
                leader.last_name as leader_last_name
             FROM Parties p
             LEFT JOIN Users leader ON p.leader_id = leader.id
             WHERE p.guild_id = ?
             ORDER BY p.name`,
            [guildId]
        );

        const partiesWithMembers = parties.map(party => {
            const partyMembers = members
                .filter(m => m.party_id === party.id)
                .map(m => ({
                    user_id: m.user_id,
                    first_name: m.first_name,
                    last_name: m.last_name,
                    level: m.level,
                    role: m.role
                }));
            return {
                ...party,
                members: partyMembers,
                member_count: partyMembers.length
            };
        });

        return NextResponse.json(partiesWithMembers);

    } catch (err) {
        console.log('Get party members error:', err);
        return NextResponse.json({ error: 'Failed to get party members' }, { status: 500 });
    }
}
