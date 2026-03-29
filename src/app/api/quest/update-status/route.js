import pool from '@/lib/db';
import { getUserFromToken } from '@/lib/getUserFromToken';
import { NextResponse } from 'next/server';

export async function POST(req) {
    const user = await getUserFromToken();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { questId, status, block_reason } = await req.json();

        const [quest] = await pool.query(
            `SELECT * FROM Quests WHERE id = ? AND assigned_to = ?`,
            [questId, user.id]
        );

        if (!quest.length) {
            return NextResponse.json({ error: 'Quest not found or not assigned to you' }, { status: 404 });
        }

        const currentStatus = quest[0].status;

        const validTransitions = {
            'assigned': ['in_progress'],
            'in_progress': ['blocked', 'pending_review'],
            'blocked': ['in_progress'],
        };

        if (!validTransitions[currentStatus]?.includes(status)) {
            return NextResponse.json({ 
                error: `Cannot change status from '${currentStatus}' to '${status}'` 
            }, { status: 400 });
        }

        if (status === 'blocked') {
            await pool.query(
                `UPDATE Quests SET status = ?, block_reason = ?, revision_note = NULL WHERE id = ?`,
                [status, block_reason || null, questId]
            );
        } else if (status === 'pending_review') {
            await pool.query(
                `UPDATE Quests SET status = ?, block_reason = NULL WHERE id = ?`,
                [status, questId]
            );
        } else {
            await pool.query(
                `UPDATE Quests SET status = ?, block_reason = NULL WHERE id = ?`,
                [status, questId]
            );
        }

        return NextResponse.json({ success: true });

    } catch (err) {
        console.log('Update status error:', err);
        return NextResponse.json({ error: 'Failed to update quest status' }, { status: 500 });
    }
}
