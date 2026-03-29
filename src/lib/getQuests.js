import pool from './db';

export async function getQuests(userId, guildId, partyId) {

    let guildQuests = [];
    let partyQuests = [];
    let publicQuests = [];

    if (guildId) {
        const [rows] = await pool.query(
            `SELECT * FROM Quests WHERE guild_id = ? AND context_type = 'guild' AND status IN ('available', 'assigned')`,
            [guildId]
        );
        guildQuests = rows;
    }

    if (partyId) {
        const [rows] = await pool.query(
            `SELECT * FROM Quests WHERE party_id = ? AND context_type = 'party' AND status IN ('available', 'assigned')`,
            [partyId]
        );
        partyQuests = rows;
    }

    const [assignedRows] = await pool.query(
        `SELECT * FROM Quests WHERE assigned_to = ? AND status = 'assigned'`,
        [userId]
    );
    const assignedQuests = assignedRows;

    return {
        guildQuests,
        partyQuests,
        publicQuests,
        assignedQuests,
    };
}