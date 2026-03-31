import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import jwt from 'jsonwebtoken';

/**
 * Layout wrapper for account pages
 * - Verifies JWT token
 * - Redirects to login if missing or invalid
 */
export default async function AccountLayout({ children }) {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    // If token does not exist, redirect user to login
    if (!token) {
        redirect('/login');
    }

    try {
        // -- Verify token --
        // Throws an error if token is invalid or expired
        jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        // If token verification fails, redirect to login
        redirect('/login');
    }

    return (
        <div className='min-h-screen w-full flex flex-col content-center'>
            {children}
        </div>
    );
}