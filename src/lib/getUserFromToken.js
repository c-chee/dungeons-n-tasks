import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import pool from './db';

/**
 * Returns the authenticated user based on JWT token in cookies.
 * Includes guild info if user belongs to a guild.
 */
export async function getUserFromToken() {
    const token = cookies().get('token')?.value;

    if (!token) return null;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Fetch guild membership role
        const [guildMembership] = await pool.query(
            `SELECT gm.guild_id, gm.role, g.name AS guild_name
             FROM GuildMembers gm
             LEFT JOIN Guilds g ON g.id = gm.guild_id
             WHERE gm.user_id = ? AND gm.status = 'approved' LIMIT 1`,
            [decoded.id]
        );

        const guild = guildMembership[0] || null;

        return {
            id: decoded.id,
            guild, // { guild_id, role, guild_name } or null
        };
    } catch (err) {
        console.error('JWT verification failed:', err);
        return null;
    }
}