import pool from './db';
import { getQuests } from './getQuests';

/**
 * Returns all dashboard data for a user:
 * - user info
 * - guild/party memberships
 * - pending requests if guild master / leader
 * - assigned quests
 */
export async function getDashboardData(userId) {

    // 1. Get user
    const [users] = await pool.query(
        'SELECT id, coins, level FROM Users WHERE id = ?',
        [userId]
    );
    const user = users[0];

    // 2. Guild membership
    const [guildMembership] = await pool.query(
        `SELECT g.id AS guild_id, g.name, g.join_code, gm.role, gm.status
        FROM GuildMembers gm
        JOIN Guilds g ON g.id = gm.guild_id
        WHERE gm.user_id = ? AND gm.status = 'approved'`,
        [userId]
    );

    const guild = guildMembership[0] || null;

    // 2b. Pending guild requests (user has sent a request but not approved yet)
    const [pendingGuildRequests] = await pool.query(
        `SELECT g.id AS guild_id, g.name, gm.status
         FROM GuildMembers gm
         JOIN Guilds g ON g.id = gm.guild_id
         WHERE gm.user_id = ? AND gm.status = 'pending'`,
        [userId]
    );

    let joinCode = null;
    if (guild) {
        const [guildRows] = await pool.query(
            `SELECT join_code FROM Guilds WHERE id = ?`,
            [guild.guild_id]
        );
        joinCode = guildRows[0]?.join_code || null;
    }

    // 3. Party membership
    const [partyMembership] = await pool.query(
        `SELECT pm.party_id, pm.role, pm.status
         FROM PartyMembers pm
         WHERE pm.user_id = ? AND pm.status = 'approved'`,
        [userId]
    );
    const party = partyMembership[0] || null;

    // 4. Guild join requests (ONLY if guild master)
    let guildRequests = [];
    if (guild && guild.role === 'guild_master') {
        const [rows] = await pool.query(
            `SELECT gm.user_id, CONCAT(u.first_name, ' ', u.last_name) AS username
            FROM GuildMembers gm
            JOIN Users u ON u.id = gm.user_id
            WHERE gm.guild_id = ? AND gm.status = 'pending'`,
            [guild.guild_id]
        );
        guildRequests = rows;
    }

    // 5. Party join requests (ONLY if leader)
    let partyRequests = [];
    if (party && party.role === 'leader') {
        const [rows] = await pool.query(
            `SELECT pm.user_id, CONCAT(u.first_name, ' ', u.last_name) AS username
            FROM PartyMembers pm
            JOIN Users u ON u.id = pm.user_id
            WHERE pm.party_id = ? AND pm.status = 'pending'`,
            [party.party_id]
        );
        partyRequests = rows;
    }

    // 6. Quests
    const quests = await getQuests(
        userId,
        guild?.guild_id,
        party?.party_id
    );

    return JSON.parse(JSON.stringify({
        user,
        guild,
        party,
        guildRequests,
        partyRequests,
        pendingGuildRequests,
        quests: quests || {
            guildQuests: [],
            partyQuests: [],
            publicQuests: [],
            assignedQuests: [],
        },
        joinCode,
    }));
}