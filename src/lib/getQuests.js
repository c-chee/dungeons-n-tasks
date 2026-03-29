import pool from './db';

export async function getQuests(userId, guildId, partyId) {

    let guildQuests = [];
    let partyQuests = [];
    let publicQuests = [];
    let assignedQuests = [];
    let pendingReviewQuests = [];

    if (guildId) {
        const [rows] = await pool.query(
            `SELECT * FROM Quests WHERE guild_id = ? AND context_type = 'guild' AND status IN ('available', 'assigned', 'in_progress', 'blocked', 'pending_review')`,
            [guildId]
        );
        guildQuests = rows;

        const [pendingRows] = await pool.query(
            `SELECT * FROM Quests WHERE guild_id = ? AND status = 'pending_review'`,
            [guildId]
        );
        pendingReviewQuests = pendingRows;
    }

    if (partyId) {
        const [rows] = await pool.query(
            `SELECT * FROM Quests WHERE party_id = ? AND context_type = 'party' AND status IN ('available', 'assigned', 'in_progress', 'blocked', 'pending_review')`,
            [partyId]
        );
        partyQuests = rows;
    }

    const [assignedRows] = await pool.query(
        `SELECT q.*, g.name AS guild_name
         FROM Quests q
         LEFT JOIN Guilds g ON q.guild_id = g.id
         WHERE q.assigned_to = ? AND q.status IN ('assigned', 'in_progress', 'blocked', 'pending_review', 'completed')`,
        [userId]
    );
    assignedQuests = assignedRows;

    return {
        guildQuests,
        partyQuests,
        publicQuests,
        assignedQuests,
        pendingReviewQuests,
    };
}
