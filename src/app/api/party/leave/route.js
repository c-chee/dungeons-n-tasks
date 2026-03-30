import pool from '@/lib/db';
import { getUserFromToken } from '@/lib/getUserFromToken';
import { NextResponse } from 'next/server';

export async function POST(req) {
    const user = await getUserFromToken();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { partyId } = await req.json();

        const [member] = await pool.query(
            `SELECT * FROM PartyMembers WHERE party_id = ? AND user_id = ? AND status = 'approved'`,
            [partyId, user.id]
        );

        if (!member.length) {
            return NextResponse.json({ error: 'You are not a member of this party' }, { status: 404 });
        }

        await pool.query(
            `DELETE FROM PartyMembers WHERE party_id = ? AND user_id = ?`,
            [partyId, user.id]
        );

        return NextResponse.json({ success: true, message: 'Left party successfully' });

    } catch (err) {
        console.log('Leave party error:', err);
        return NextResponse.json({ error: 'Failed to leave party' }, { status: 500 });
    }
}
