import pool from '@/lib/db'; // MySQL database connection pool
import bcrypt from 'bcryptjs'; // For password hashing and comparison
import jwt from 'jsonwebtoken'; // Creates JWT tokens
import { NextResponse } from 'next/server'; // From Next.js for structured responses

// Helper
// Generates a random 6-10 character alphanumeric join code
function generateJoinCode(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// === POST ===
// Handler to register a new user
export async function POST(req) {
    try {
        // 1. Parse request body
        const body = await req.json();
        const { first_name, last_name, email, password, account_type, guild_name } = body;

        // 2. Check if email exists
        const [existingUsers] = await pool.query(
        `SELECT * FROM Users WHERE email = ?`,
        [email]
        );
        if (existingUsers.length > 0) {
        return NextResponse.json({ success: false, error: 'Email already registered' });
        }

        // 3. Hash password
        const password_hash = await bcrypt.hash(password, 12);

        // 4. Insert user first (important: get userId)
        const [result] = await pool.query(
        `INSERT INTO Users 
        (first_name, last_name, email, password_hash)
        VALUES (?, ?, ?, ?)`,
        [first_name, last_name, email, password_hash]
        );
        const userId = result.insertId;

        // 5. If guild master, create guild **after user exists**
        let joinCode;
        if (account_type === 'guild_master') {
            const join_code = generateJoinCode(); // generate join code

            // Create guild
            const [guildResult] = await pool.query(
                `INSERT INTO Guilds (name, owner_id, join_code) VALUES (?, ?, ?)`,
                [guild_name, userId, join_code] // include join_code
            );

            const guildId = guildResult.insertId;

            // Add user as guild master
            await pool.query(
                `INSERT INTO GuildMembers (guild_id, user_id, role, status)
                VALUES (?, ?, 'guild_master', 'approved')`,
                [guildId, userId]
            );
        }

        // 6. Create JWT token and send response
        const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

        const response = NextResponse.json({
        success: true,
        user: { id: userId },
        joinCode // optional: only present for guild master
        });

        response.cookies.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
        });

        return response;

    } catch (err) {
        // console.error(err);
        return NextResponse.json({ success: false, error: err.message });
    }
}