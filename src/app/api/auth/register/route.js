import pool from '@/lib/db'; // MySQL database connection pool
import bcrypt from 'bcryptjs'; // For password hashing and comparison
import jwt from 'jsonwebtoken'; // Creates JWT tokens
import { NextResponse } from 'next/server'; // From Next.js for structured responses

// === POST ===
// Handler to register a new user
export async function POST(req) {
    try {
        // Parse request body
        const body = await req.json();
        const { first_name, last_name, email, password } = body;

        // Check if email already exists
        const [existingUsers] = await pool.query(
            `SELECT * FROM Users WHERE email = ?`,
            [email]
        );

        if (existingUsers.length > 0) {
            return NextResponse.json({
                success: false,
                error: 'Email already registered'
            });
        }

        // Hash password
        const password_hash = await bcrypt.hash(password, 12);

        // Insert new user
        const [result] = await pool.query(
            `INSERT INTO Users 
            (first_name, last_name, email, password_hash)
            VALUES (?, ?, ?, ?)`,
            [first_name, last_name, email, password_hash]
        );

        const userId = result.insertId;

        // Create JWT token
        const token = jwt.sign(
            { id: userId },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Return response and set cookie
        const response = NextResponse.json({
            success: true,
            user: { id: userId }
        });

        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // 7 days
        });

        return response;

    } catch (err) {
        // console.error(err);
        return NextResponse.json({ success: false, error: err.message });
    }
}