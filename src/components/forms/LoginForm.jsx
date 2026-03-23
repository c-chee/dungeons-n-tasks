'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TextField } from './TextField';
import BubbleButton from '../ui/BubbleButton';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const isValid = isValidEmail(email) && password.length >= 8;

  return (
    <div className='w-full h-full flex flex-col justify-center items-center p-8 gap-4'>

      <h2 className='arcade text-2xl font-bold'>Login</h2>

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

      {/* -- Login submit button */}
      <BubbleButton
        onClick={() => {
          if (!isValid) return;
          console.log('login', { email, password });
        }}
      >
        Login
      </BubbleButton>

      {/* Dont have acc message */}
      <p className='text-[15px]'>
        Don’t have an account?{' '}
        <span
          className='cursor-pointer font-bold'
          onClick={() => router.push('/register')}
        >
          Register
        </span>
      </p>
    </div>
  );
}