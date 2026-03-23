'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TextField } from './TextField';
import BubbleButton from '../ui/BubbleButton';

export default function RegisterForm() {
    const router = useRouter();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const isValidEmail = (email) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const isValid =
        firstName &&
        lastName &&
        isValidEmail(email) &&
        password.length >= 8;

    return (
        <div className='w-full h-full flex flex-col justify-center items-center p-8 gap-4'>

            {/* -- Title -- */}
            <h2 className='arcade text-2xl font-bold'>Register</h2>

            {/* -- First Name -- */}
            <TextField
                label='First Name'
                value={firstName}
                onChange={setFirstName}
                required
            />

            {/* -- Last Name -- */}
            <TextField
                label='Last Name'
                value={lastName}
                onChange={setLastName}
                required
            />

            {/* -- Email -- */}
            <TextField
                label='Email'
                type='email'
                value={email}
                onChange={setEmail}
                required
            />

            {/* -- Password -- */}
            <TextField
                label='Password'
                type='password'
                value={password}
                onChange={setPassword}
                required
            />

            {/* -- Register Submit Button -- */}
            <BubbleButton
                onClick={() => {
                if (!isValid) return;
                console.log('register', { firstName, lastName, email, password });
                }}
            >
                Register
            </BubbleButton>

            <p className='text-[15px]'>
                Already have an account?{' '}
                <span
                className='cursor-pointer font-bold'
                onClick={() => router.push('/login')}
                >
                Login
                </span>
            </p>
        </div>
    );
}