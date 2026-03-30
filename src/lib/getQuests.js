import pool from './db';

export async function getQuests(userId, guildId, partyId) {

    let guildQuests = [];
    let partyQuests = [];
    let publicQuests = [];
    let assignedQuests = [];
    let pendingReviewQuests = [];
    let partyPendingReviewQuests = [];
    let pickupRequests = [];
    let availableQuests = [];

    if (guildId) {
        const [guildRows] = await pool.query(
            `SELECT q.*, p.name as party_name
             FROM Quests q
             LEFT JOIN Parties p ON q.party_id = p.id
             WHERE q.guild_id = ? AND q.context_type = 'guild' AND q.status IN ('available', 'assigned', 'in_progress', 'blocked', 'pending_review')`,
            [guildId]
        );
        guildQuests = guildRows;

        const [pendingRows] = await pool.query(
            `SELECT q.*, p.name as party_name
             FROM Quests q
             LEFT JOIN Parties p ON q.party_id = p.id
             WHERE q.guild_id = ? AND q.status = 'pending_review'`,
            [guildId]
        );
        pendingReviewQuests = pendingRows;

        const [guildAvailableRows] = await pool.query(
            `SELECT q.*, 
                u.first_name as assigned_first_name, 
                u.last_name as assigned_last_name,
                pqr.requesters,
                creator.first_name as creator_first_name,
                creator.last_name as creator_last_name
             FROM Quests q
             LEFT JOIN Users u ON q.assigned_to = u.id
             LEFT JOIN Users creator ON q.created_by = creator.id
             LEFT JOIN (
                SELECT quest_id, GROUP_CONCAT(CONCAT(u2.first_name, ' ', u2.last_name)) as requesters
                FROM QuestPickupRequests pqr
                JOIN Users u2 ON pqr.user_id = u2.id
                WHERE pqr.status = 'pending'
                GROUP BY quest_id
             ) pqr ON q.id = pqr.quest_id
             WHERE q.guild_id = ? AND q.context_type = 'guild'
             ORDER BY q.status = 'completed' ASC, q.created_at DESC`,
            [guildId]
        );
        availableQuests = guildAvailableRows;

        const [guildPartyQuests] = await pool.query(
            `SELECT q.*, 
                u.first_name as assigned_first_name, 
                u.last_name as assigned_last_name,
                pqr.requesters,
                creator.first_name as creator_first_name,
                creator.last_name as creator_last_name,
                p.name as party_name
             FROM Quests q
             LEFT JOIN Users u ON q.assigned_to = u.id
             LEFT JOIN Users creator ON q.created_by = creator.id
             LEFT JOIN Parties p ON q.party_id = p.id
             LEFT JOIN (
                SELECT quest_id, GROUP_CONCAT(CONCAT(u2.first_name, ' ', u2.last_name)) as requesters
                FROM QuestPickupRequests pqr
                JOIN Users u2 ON pqr.user_id = u2.id
                WHERE pqr.status = 'pending'
                GROUP BY quest_id
             ) pqr ON q.id = pqr.quest_id
             WHERE p.guild_id = ? AND q.context_type = 'party'
             ORDER BY q.status = 'completed' ASC, q.created_at DESC`,
            [guildId]
        );
        availableQuests = [...availableQuests, ...guildPartyQuests];
        partyQuests = guildPartyQuests;
        partyPendingReviewQuests = guildPartyQuests.filter(q => q.status === 'pending_review');

        const [requests] = await pool.query(
            `SELECT 
                qpr.id,
                qpr.quest_id,
                qpr.user_id,
                qpr.status,
                qpr.created_at,
                q.title as quest_title,
                q.context_type,
                u.first_name,
                u.last_name,
                u.level as user_level,
                p.name as party_name
             FROM QuestPickupRequests qpr
             JOIN Quests q ON q.id = qpr.quest_id
             JOIN Users u ON u.id = qpr.user_id
             LEFT JOIN Parties p ON q.party_id = p.id
             WHERE qpr.guild_id = ? AND qpr.status = 'pending'
             ORDER BY qpr.created_at DESC`,
            [guildId]
        );
        pickupRequests = requests;
    } else if (partyId) {
        const [partyRows] = await pool.query(
            `SELECT q.*, p.name as party_name
             FROM Quests q
             LEFT JOIN Parties p ON q.party_id = p.id
             WHERE q.party_id = ? AND q.context_type = 'party' AND q.status IN ('available', 'assigned', 'in_progress', 'blocked', 'pending_review')`,
            [partyId]
        );
        partyQuests = partyRows;

        const [partyPendingRows] = await pool.query(
            `SELECT q.*, p.name as party_name
             FROM Quests q
             LEFT JOIN Parties p ON q.party_id = p.id
             WHERE q.party_id = ? AND q.status = 'pending_review'`,
            [partyId]
        );
        partyPendingReviewQuests = partyPendingRows;

        const [partyAvailableRows] = await pool.query(
            `SELECT q.*, 
                u.first_name as assigned_first_name, 
                u.last_name as assigned_last_name,
                pqr.requesters,
                creator.first_name as creator_first_name,
                creator.last_name as creator_last_name,
                p.name as party_name
             FROM Quests q
             LEFT JOIN Users u ON q.assigned_to = u.id
             LEFT JOIN Users creator ON q.created_by = creator.id
             LEFT JOIN Parties p ON q.party_id = p.id
             LEFT JOIN (
                SELECT quest_id, GROUP_CONCAT(CONCAT(u2.first_name, ' ', u2.last_name)) as requesters
                FROM QuestPickupRequests pqr
                JOIN Users u2 ON pqr.user_id = u2.id
                WHERE pqr.status = 'pending'
                GROUP BY quest_id
             ) pqr ON q.id = pqr.quest_id
             WHERE q.party_id = ? AND q.context_type = 'party'
             ORDER BY q.status = 'completed' ASC, q.created_at DESC`,
            [partyId]
        );
        availableQuests = partyAvailableRows;
    }

    const [assignedRows] = await pool.query(
        `SELECT q.*, g.name AS guild_name, p.name AS party_name
         FROM Quests q
         LEFT JOIN Guilds g ON q.guild_id = g.id
         LEFT JOIN Parties p ON q.party_id = p.id
         WHERE q.assigned_to = ? AND q.status IN ('assigned', 'in_progress', 'blocked', 'pending_review', 'completed')`,
        [userId]
    );
    assignedQuests = assignedRows;

    const [userRequests] = await pool.query(
        `SELECT * FROM QuestPickupRequests WHERE user_id = ? AND status = 'pending'`,
        [userId]
    );
    const userPendingRequests = userRequests;

    return {
        guildQuests,
        partyQuests,
        publicQuests,
        assignedQuests,
        pendingReviewQuests,
        partyPendingReviewQuests,
        availableQuests,
        pickupRequests,
        userPendingRequests,
    };
}
