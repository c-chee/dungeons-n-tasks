'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import TextField  from './TextField';
import BubbleButton from '../ui/BubbleButton';
import RoleRadioButton from './RoleRadioButton';

export default function RegisterForm() {
    const router = useRouter();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [accountType, setAccountType] = useState('member');
    const [guildName, setGuildName] = useState('');

    const [loading, setLoading] = useState(false);

    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const isValid =
        firstName &&
        lastName &&
        isValidEmail(email) &&
        password.length >= 8 &&
        (accountType === 'member' || (accountType === 'guild_master' && guildName));

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
                console.error(data.error || 'Register failed');
                setLoading(false);
                return;
            }

            router.push('/login');

        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className='w-full h-full flex flex-col justify-center items-center p-8 gap-4'
        >
            <h2 className='arcade outline-text text-2xl font-bold'>Register</h2>

            <div className='flex flex-col gap-2 w-full'>
                <RoleRadioButton
                    value='member'
                    checked={accountType === 'member'}
                    onChange={() => setAccountType('member')}
                    label='Member'
                    description='Join a guild and complete quests'
                />
                
                <RoleRadioButton
                    value='guild_master'
                    checked={accountType === 'guild_master'}
                    onChange={() => setAccountType('guild_master')}
                    label='Guild Master'
                    description='Create a guild and manage quests'
                />
            </div>

            <TextField
                label='First Name'
                value={firstName}
                onChange={setFirstName}
                required
            />

            <TextField
                label='Last Name'
                value={lastName}
                onChange={setLastName}
                required
            />

            <TextField
                label='Email'
                type='email'
                value={email}
                onChange={setEmail}
                required
            />

            <TextField
                label='Password'
                type='password'
                value={password}
                onChange={setPassword}
                required
            />

            {accountType === 'guild_master' && (
                <TextField
                    label="Guild Name"
                    value={guildName}
                    onChange={setGuildName}
                    required
                />
            )}

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