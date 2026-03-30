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
        'SELECT id, first_name, last_name, coins, level, level_xp FROM Users WHERE id = ?',
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
    let guildMembers = [];
    let guildParties = [];
    
    if (guild) {
        const [guildRows] = await pool.query(
            `SELECT join_code FROM Guilds WHERE id = ?`,
            [guild.guild_id]
        );
        joinCode = guildRows[0]?.join_code || null;

        // Get guild members
        const [memberRows] = await pool.query(
            `SELECT u.id, u.first_name, u.last_name, u.level, gm.role,
                    p.name as party_name
             FROM GuildMembers gm
             JOIN Users u ON u.id = gm.user_id
             LEFT JOIN PartyMembers pm ON pm.user_id = u.id AND pm.status = 'approved'
             LEFT JOIN Parties p ON p.id = pm.party_id
             WHERE gm.guild_id = ? AND gm.status = 'approved'`,
            [guild.guild_id]
        );
        guildMembers = memberRows;

        // Get guild parties with members
        const [partyRows] = await pool.query(
            `SELECT p.*,
                leader.first_name as leader_first_name,
                leader.last_name as leader_last_name
             FROM Parties p
             LEFT JOIN Users leader ON p.leader_id = leader.id
             WHERE p.guild_id = ?
             ORDER BY p.name`,
            [guild.guild_id]
        );

        // Get all party members for these parties
        const [partyMemberRows] = await pool.query(
            `SELECT pm.party_id, pm.user_id, pm.role, u.first_name, u.last_name, u.level
             FROM PartyMembers pm
             JOIN Users u ON pm.user_id = u.id
             JOIN Parties p ON pm.party_id = p.id
             WHERE p.guild_id = ? AND pm.status = 'approved'
             ORDER BY pm.party_id, pm.role DESC`,
            [guild.guild_id]
        );

        // Group members by party
        const membersByParty = {};
        for (const member of partyMemberRows) {
            if (!membersByParty[member.party_id]) {
                membersByParty[member.party_id] = [];
            }
            membersByParty[member.party_id].push({
                user_id: member.user_id,
                first_name: member.first_name,
                last_name: member.last_name,
                level: member.level,
                role: member.role
            });
        }

        // Attach members to parties
        guildParties = partyRows.map(party => ({
            ...party,
            members: membersByParty[party.id] || [],
            member_count: (membersByParty[party.id] || []).length
        }));
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
        guildMembers,
        guildParties,
        quests: quests || {
            guildQuests: [],
            partyQuests: [],
            publicQuests: [],
            assignedQuests: [],
            availableQuests: [],
            pickupRequests: [],
            userPendingRequests: [],
        },
        joinCode,
    }));
}