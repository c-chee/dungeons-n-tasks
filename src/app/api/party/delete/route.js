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

        const [party] = await pool.query(
            `SELECT * FROM Parties WHERE id = ?`,
            [partyId]
        );

        if (!party.length) {
            return NextResponse.json({ error: 'Party not found' }, { status: 404 });
        }

        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            await connection.query(
                `DELETE FROM PartyMembers WHERE party_id = ?`,
                [partyId]
            );

            await connection.query(
                `DELETE FROM Parties WHERE id = ?`,
                [partyId]
            );

            await connection.commit();
            connection.release();

            return NextResponse.json({ success: true, message: 'Party deleted successfully' });

        } catch (err) {
            await connection.rollback();
            connection.release();
            throw err;
        }

    } catch (err) {
        console.log('Delete party error:', err);
        return NextResponse.json({ error: 'Failed to delete party' }, { status: 500 });
    }
}
