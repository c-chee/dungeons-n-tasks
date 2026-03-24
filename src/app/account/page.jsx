import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import jwt from 'jsonwebtoken';

export const metadata = {
    title: 'Dashboard',
};

export default function DashboardPage() {
  
  const token = cookies().get('token')?.value; // Reads the token from cookies

  // If token does not exist, redirect user to login
  if (!token) {
    redirect('/login');
  }

  try {
    // -- Verify token --
    // Throws an error if token is invalid or expired
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // -- Render dashboard --
    return (
      <div className='max-w-4xl mx-auto p-6'>
        <h1 className='text-2xl font-bold mb-4'>Welcome user {decoded.id}</h1>
      </div>
    );

  } catch (err) {
    // If token verification fails, redirect to login
    redirect('/login');
  }
}