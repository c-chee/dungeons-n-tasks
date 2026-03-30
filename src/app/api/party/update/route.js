import pool from '@/lib/db';
import { getUserFromToken } from '@/lib/getUserFromToken';
import { NextResponse } from 'next/server';

export async function POST(req) {
    const user = await getUserFromToken();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { partyId, action, name, leaderId, memberIds, addMemberIds, removeMemberIds } = await req.json();

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
            if (action === 'update') {
                if (name !== undefined) {
                    await connection.query(
                        `UPDATE Parties SET name = ? WHERE id = ?`,
                        [name.trim(), partyId]
                    );
                }

                if (leaderId !== undefined) {
                    await connection.query(
                        `UPDATE Parties SET leader_id = ? WHERE id = ?`,
                        [leaderId, partyId]
                    );

                    if (leaderId) {
                        await connection.query(
                            `UPDATE PartyMembers SET role = 'member' WHERE party_id = ?`,
                            [partyId]
                        );
                        await connection.query(
                            `UPDATE PartyMembers SET role = 'leader' WHERE party_id = ? AND user_id = ?`,
                            [partyId, leaderId]
                        );
                    }
                }

                if (addMemberIds?.length > 0) {
                    for (const memberId of addMemberIds) {
                        const [existing] = await connection.query(
                            `SELECT * FROM PartyMembers WHERE party_id = ? AND user_id = ?`,
                            [partyId, memberId]
                        );
                        if (!existing.length) {
                            await connection.query(
                                `INSERT INTO PartyMembers (party_id, user_id, role, status) VALUES (?, ?, 'member', 'approved')`,
                                [partyId, memberId]
                            );
                        }
                    }
                }

                if (removeMemberIds?.length > 0) {
                    for (const memberId of removeMemberIds) {
                        await connection.query(
                            `DELETE FROM PartyMembers WHERE party_id = ? AND user_id = ?`,
                            [partyId, memberId]
                        );
                    }
                }
            }

            await connection.commit();
            connection.release();

            return NextResponse.json({ success: true, message: 'Party updated successfully' });

        } catch (err) {
            await connection.rollback();
            connection.release();
            throw err;
        }

    } catch (err) {
        console.log('Update party error:', err);
        return NextResponse.json({ error: 'Failed to update party' }, { status: 500 });
    }
}
