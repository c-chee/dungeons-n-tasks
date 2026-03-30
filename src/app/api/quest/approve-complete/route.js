import pool from '@/lib/db';
import { getUserFromToken } from '@/lib/getUserFromToken';
import { NextResponse } from 'next/server';

export async function POST(req) {
    const user = await getUserFromToken();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!user.guild || user.guild.role !== 'guild_master') {
        return NextResponse.json({ error: 'Only guild masters can approve quest completions' }, { status: 403 });
    }

    try {
        const { questId } = await req.json();

        const [quest] = await pool.query(
            `SELECT * FROM Quests WHERE id = ? AND guild_id = ?`,
            [questId, user.guild.guild_id]
        );

        if (!quest.length) {
            return NextResponse.json({ error: 'Quest not found' }, { status: 404 });
        }

        if (quest[0].status !== 'pending_review') {
            return NextResponse.json({ error: 'Quest is not pending review' }, { status: 400 });
        }

        const questData = quest[0];
        const rewardCoins = questData.reward_coins;
        const rewardXp = questData.reward_xp;
        const partyId = questData.party_id;
        const contextType = questData.context_type;
        const isPartyQuest = contextType === 'party' && partyId;

        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            await connection.query(
                `UPDATE Quests SET status = 'completed', completed_at = NOW(), revision_note = NULL WHERE id = ?`,
                [questId]
            );

            if (isPartyQuest) {
                await connection.query(
                    `UPDATE Parties SET xp_current = xp_current + ? WHERE id = ?`,
                    [rewardXp, partyId]
                );

                await connection.commit();
                connection.release();

                return NextResponse.json({
                    success: true,
                    rewards: {
                        coins: rewardCoins,
                        xp: rewardXp
                    },
                    partyId: partyId,
                    isPartyQuest: true
                });
            }

            const assignedUserId = questData.assigned_to;
            const [assignedUser] = await pool.query('SELECT * FROM Users WHERE id = ?', [assignedUserId]);
            
            if (!assignedUser.length) {
                await connection.rollback();
                connection.release();
                return NextResponse.json({ error: 'Assigned user not found' }, { status: 404 });
            }

            await connection.query(
                `INSERT INTO QuestCompletions (quest_id, user_id) VALUES (?, ?)`,
                [questId, assignedUserId]
            );

            const newCoins = assignedUser[0].coins + rewardCoins;
            const newXp = assignedUser[0].level_xp + rewardXp;
            const newLevel = Math.floor(newXp / 100) + 1;

            await connection.query(
                `UPDATE Users SET coins = ?, level_xp = ?, level = ? WHERE id = ?`,
                [newCoins, newXp, newLevel, assignedUserId]
            );

            await connection.commit();
            connection.release();

            return NextResponse.json({
                success: true,
                rewards: {
                    coins: rewardCoins,
                    xp: rewardXp
                },
                user: {
                    id: assignedUserId,
                    coins: newCoins,
                    level_xp: newXp,
                    level: newLevel
                }
            });

        } catch (err) {
            await connection.rollback();
            connection.release();
            throw err;
        }

    } catch (err) {
        console.log('Approve complete error:', err);
        return NextResponse.json({ error: 'Failed to approve quest completion' }, { status: 500 });
    }
}
