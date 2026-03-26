import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export function getUserFromToken() {
    const token = cookies().get('token')?.value;

    if (!token) return null;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return { id: decoded.id }; 
    } catch (err) {
        console.error('JWT verification failed:', err);
        return null;
    }
}