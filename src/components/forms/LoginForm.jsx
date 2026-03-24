'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import TextField from './TextField';
import BubbleButton from '../ui/BubbleButton';

export default function LoginForm() {
  const router = useRouter();

  // Single state object
  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  // --- Validation ---
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const isValid = isValidEmail(form.email) && form.password.length >= 8;

  // --- Handlers ---
  // Change handler
  const handleChange = (field) => (value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValid) return;

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.error || 'Login failed');
        return;
      }

      router.push('/account');

    } catch (err) {
      // console.error(err);
      alert('Something went wrong');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className='w-full h-full flex flex-col justify-center items-center p-8 gap-4'
    >

      <h2 className='arcade text-2xl font-bold'>Login</h2>

      {/* Email */}
      <TextField
        label='Email'
        type='email'
        value={form.email}
        onChange={handleChange('email')}
        required
      />

      {/* Password */}
      <TextField
        label='Password'
        type='password'
        value={form.password}
        onChange={handleChange('password')}
        required
      />

      {/* Submit */}
      <BubbleButton type="submit" disabled={!isValid}>
        Login
      </BubbleButton>

      {/* Register Button */}
      <p className='text-[15px]'>

        Don’t have an account?{' '}

        <span
          className='cursor-pointer font-bold'
          onClick={() => router.push('/register')}
        >
          Register
        </span>

      </p>

    </form>
  );
}