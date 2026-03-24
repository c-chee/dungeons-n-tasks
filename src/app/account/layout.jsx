import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import jwt from 'jsonwebtoken';

export default function AccountLayout({ children }) {
    
    const token = cookies().get('token')?.value; // Reads the token from cookies

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
        <div className='
            max-w-4xl mx-auto p-6 
            mt-[4em]'
        >
            {children}
        </div>
    );
}