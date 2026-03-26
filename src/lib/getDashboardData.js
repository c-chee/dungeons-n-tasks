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
        `SELECT gm.guild_id, gm.role, g.name AS guild_name, gm.status
         FROM GuildMembers gm
         LEFT JOIN Guilds g ON g.id = gm.guild_id
         WHERE gm.user_id = ? AND gm.status = 'approved'`,
        [userId]
    );
    const guild = guildMembership[0] || null;

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
            `SELECT gm.user_id, u.username
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
            `SELECT pm.user_id, u.username
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
        quests: quests || {
            guildQuests: [],
            partyQuests: [],
            publicQuests: [],
            assignedQuests: [],
        },
    }));
}