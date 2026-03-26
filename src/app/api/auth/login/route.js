import pool from '@/lib/db'; // MySQL database connection pool
import bcrypt from 'bcryptjs'; // For password hashing and comparison
import jwt from 'jsonwebtoken'; // Creates JWT tokens
import { NextResponse } from 'next/server'; // From Next.js for structured responses

// === POST ===
// Request handler for logging in a user
export async function POST(req) {
    try {
        // Parse JSON body from the incoming request
        const body = await req.json();
        const { email, password } = body;

        /**
         * -- Basic validation --
         * Ensure required fields exist (do not rely only on frontend)
         */
        if (!email || !password) {
            return NextResponse.json({
                success: false,
                error: 'Missing email or password'
            });
        }

        /**
         * -- Find user in database --
         * Query the Users table for a row with the matching email
         */
        const [rows] = await pool.query(
            `SELECT * FROM Users WHERE email = ?`,
            [email]
        );

        // If no user is found, return a generic error (prevents user enumeration)
        if (rows.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        const user = rows[0];

        /**
         * -- Verify password --
         * bcrypt.compare hashes the given password and compares it with the stored hash
         */
        const valid = await bcrypt.compare(password, user.password_hash);

        if (!valid) {
            return NextResponse.json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        /**
         * -- Fetch guild membership (NEW) --
         * Get the user's guild + role if they are in one
         */
        const [membership] = await pool.query(
            `SELECT guild_id, role 
             FROM GuildMembers 
             WHERE user_id = ? 
             AND status = 'approved'
             LIMIT 1`,
            [user.id]
        );

        const guildInfo = membership[0] || null;

        /**
         * -- Create JWT token --
         * Token includes the user's ID and is signed with a secret from environment variables
         */
        const token = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' } //The token will expire in 7 days
        );

        /**
         * -- Create response --
         * Sends back a JSON response with the user ID + guild info
         */
        const response = NextResponse.json({
            success: true,
            user: {
                id: user.id,
                guild: guildInfo // NEW: includes { guild_id, role } or null
            }
        });

        /**
         * -- Set cookie for automatic login --
         * Stores the JWT token in a secure, httpOnly cookie
         */
        response.cookies.set('token', token, {
            httpOnly: true, // Prevents JS access for security
            secure: process.env.NODE_ENV === 'production', // Only send cookie over HTTPS in production
            sameSite: 'strict', // Prevents Cross-site request forgery attacks
            path: '/', // Cookie is valid for entire site
            maxAge: 60 * 60 * 24 * 7, // Calcuclates 7 days in seconds
        });

        // -- Return response --
        return response;

    } catch (err) {
        // If any error occurs, log it and return a failure response
        // console.error(err);
        return NextResponse.json({ success: false, error: err.message });
    }
}