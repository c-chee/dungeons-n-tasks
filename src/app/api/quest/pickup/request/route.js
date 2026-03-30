import pool from '@/lib/db';
import { getUserFromToken } from '@/lib/getUserFromToken';
import { NextResponse } from 'next/server';

const MAX_PENDING_REQUESTS = 3;

export async function POST(req) {
    const user = await getUserFromToken();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { questId } = await req.json();

        const [quest] = await pool.query(
            'SELECT * FROM Quests WHERE id = ?',
            [questId]
        );

        if (!quest.length) {
            return NextResponse.json({ error: 'Quest not found' }, { status: 404 });
        }

        if (quest[0].status !== 'available') {
            return NextResponse.json({ error: 'Quest is not available for pickup' }, { status: 400 });
        }

        if (quest[0].assigned_to) {
            return NextResponse.json({ error: 'Quest is already assigned' }, { status: 400 });
        }

        if (quest[0].party_id) {
            const [partyMember] = await pool.query(
                `SELECT * FROM PartyMembers WHERE party_id = ? AND user_id = ? AND status = 'approved'`,
                [quest[0].party_id, user.id]
            );

            if (!partyMember.length) {
                return NextResponse.json({ error: 'Only party members can request this quest' }, { status: 403 });
            }
        }

        let guildId = quest[0].guild_id;

        if (quest[0].party_id && !guildId) {
            const [partyRows] = await pool.query(
                'SELECT guild_id FROM Parties WHERE id = ?',
                [quest[0].party_id]
            );
            if (partyRows.length) {
                guildId = partyRows[0].guild_id;
            }
        }

        const [existingRequest] = await pool.query(
            'SELECT * FROM QuestPickupRequests WHERE quest_id = ? AND user_id = ?',
            [questId, user.id]
        );

        if (existingRequest.length > 0) {
            return NextResponse.json({ error: 'You have already requested this quest' }, { status: 400 });
        }

        const [pendingCount] = await pool.query(
            'SELECT COUNT(*) as count FROM QuestPickupRequests WHERE user_id = ? AND status = "pending"',
            [user.id]
        );

        if (pendingCount[0].count >= MAX_PENDING_REQUESTS) {
            return NextResponse.json({ error: `You can only have ${MAX_PENDING_REQUESTS} pending requests at a time` }, { status: 400 });
        }

        await pool.query(
            `INSERT INTO QuestPickupRequests (quest_id, user_id, guild_id, status)
             VALUES (?, ?, ?, 'pending')`,
            [questId, user.id, guildId]
        );

        return NextResponse.json({ success: true });

    } catch (err) {
        console.log('Pickup request error:', err);
        return NextResponse.json({ error: 'Failed to request quest pickup' }, { status: 500 });
    }
}
