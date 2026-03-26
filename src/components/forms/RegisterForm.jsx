'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import TextField  from './TextField';
import BubbleButton from '../ui/BubbleButton';

export default function RegisterForm() {
    const router = useRouter();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [accountType, setAccountType] = useState('member'); // 'member' or 'guild_master'
    const [guildName, setGuildName] = useState('');

    const [loading, setLoading] = useState(false);

    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const isValid =
        firstName &&
        lastName &&
        isValidEmail(email) &&
        password.length >= 8;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isValid || loading) return;

        setLoading(true);

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    first_name: firstName,
                    last_name: lastName,
                    email,
                    password,
                    account_type: accountType,
                    guild_name: guildName
                }),
            });

            const data = await res.json();

            if (!data.success) {
                alert(data.error || 'Register failed');
                setLoading(false);
                return;
            }

            // Redirect to login
            router.push('/login');

        } catch (err) {
            // console.error(err);
            alert('Something went wrong');
            setLoading(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className='w-full h-full flex flex-col justify-center items-center p-8 gap-4'
        >
            <h2 className='arcade text-2xl font-bold'>Register</h2>

            {/* Account type selection */}
            <div className='flex gap-4'>
                <label>
                    <input
                        type='radio'
                        value='member'
                        checked={accountType === 'member'}
                        onChange={() => setAccountType('member')}
                    />
                    Member
                </label>

                <label>
                    <input
                        type='radio'
                        value='guild_master'
                        checked={accountType === 'guild_master'}
                        onChange={() => setAccountType('guild_master')}
                    />
                    Guild Master
                </label>
            </div>

            {/* First name */}
            <TextField
                label='First Name'
                value={firstName}
                onChange={setFirstName}
                required
            />

            {/* Last name */}
            <TextField
                label='Last Name'
                value={lastName}
                onChange={setLastName}
                required
            />

            {/* Email */}
            <TextField
                label='Email'
                type='email'
                value={email}
                onChange={setEmail}
                required
            />

            {/* Password */}
            <TextField
                label='Password'
                type='password'
                value={password}
                onChange={setPassword}
                required
            />

            {/* Conitional - Guild name */}
            {accountType === 'guild_master' && (
                <TextField
                    label="Guild Name"
                    value={guildName}
                    onChange={setGuildName}
                    required
                />
            )}

            {/* Submit Button */}
            <BubbleButton type='submit' disabled={!isValid || loading}>
                {loading ? 'Creating...' : 'Register'}
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
            
        </form>
    );
}