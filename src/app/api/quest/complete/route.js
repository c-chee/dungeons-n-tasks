import pool from '@/lib/db';
import { getUserFromToken } from '@/lib/getUserFromToken';
import { NextResponse } from 'next/server';

const XP_PER_LEVEL = 100;

export async function POST(req) {
    const user = await getUserFromToken();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!user.guild || user.guild.role !== 'guild_master') {
        return NextResponse.json({ error: 'Only guild masters can complete quests' }, { status: 403 });
    }

    try {
        const { questId } = await req.json();

        const [quest] = await pool.query(
            `SELECT * FROM Quests WHERE id = ? AND context_type = 'guild' AND guild_id = ?`,
            [questId, user.guild.guild_id]
        );

        if (!quest.length) {
            return NextResponse.json({ error: 'Quest not found' }, { status: 404 });
        }

        const questData = quest[0];

        if (questData.status !== 'assigned') {
            return NextResponse.json({ error: 'Quest must be assigned to be completed' }, { status: 400 });
        }

        const assignedUserId = questData.assigned_to;

        const [assignedUser] = await pool.query('SELECT * FROM Users WHERE id = ?', [assignedUserId]);
        if (!assignedUser.length) {
            return NextResponse.json({ error: 'Assigned user not found' }, { status: 404 });
        }

        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            await connection.query(
                `UPDATE Quests SET status = 'completed', completed_at = NOW() WHERE id = ?`,
                [questId]
            );

            await connection.query(
                `INSERT INTO QuestCompletions (quest_id, user_id) VALUES (?, ?)`,
                [questId, assignedUserId]
            );

            let newCoins = assignedUser[0].coins + questData.reward_coins;
            let newLevelXp = assignedUser[0].level_xp + questData.reward_xp;
            let newLevel = assignedUser[0].level;

            if (newLevelXp >= XP_PER_LEVEL) {
                newLevel += Math.floor(newLevelXp / XP_PER_LEVEL);
                newLevelXp = newLevelXp % XP_PER_LEVEL;
            }

            await connection.query(
                `UPDATE Users SET coins = ?, level_xp = ?, level = ? WHERE id = ?`,
                [newCoins, newLevelXp, newLevel, assignedUserId]
            );

            await connection.commit();
            connection.release();

            return NextResponse.json({
                success: true,
                rewards: {
                    coins: questData.reward_coins,
                    xp: questData.reward_xp
                },
                user: {
                    id: assignedUserId,
                    coins: newCoins,
                    level_xp: newLevelXp,
                    level: newLevel
                }
            });

        } catch (err) {
            await connection.rollback();
            connection.release();
            throw err;
        }

    } catch (err) {
        console.error('Complete quest error:', err);
        return NextResponse.json({ error: 'Failed to complete quest' }, { status: 500 });
    }
}
