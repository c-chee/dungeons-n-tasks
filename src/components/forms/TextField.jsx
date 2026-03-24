'use client';
import { useState } from 'react';

export default function TextField({
    label,
    type = 'text',
    value,
    onChange,
    required = false,
}) {
    const [touched, setTouched] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const isPassword = type === 'password';

    const validate = () => {
        if (required && !value) return `${label} is required`;

        if (type === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (value && !emailRegex.test(value)) {
                return 'Invalid email format';
            }
        }

        if (isPassword && value.length < 8) {
            return 'Password must be at least 8 characters';
        }

        return '';
    };

    const error = touched ? validate() : '';

    return (
        <div className='flex flex-col gap-[4px] w-full'>
            <label className='text-sm font-semibold'>{label}</label>

            <div className='relative w-full'>
                <input
                    type={isPassword && showPassword ? 'text' : type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onBlur={() => setTouched(true)}
                    className={`
                        w-full px-[12px] py-[5px] pr-[70px]
                        rounded-[10px] border-[2px]
                        bg-white/60 backdrop-blur-md
                        outline-none transition-all duration-200
                        ${error ? 'border-red-800' : 'border-white/40'}
                        focus:border-[var(--dark-brown)]
                    `}
                />

                {isPassword && (
                    <button
                        type='button'
                        onClick={() => setShowPassword(!showPassword)}
                        className='
                        absolute right-2 top-1/2 -translate-y-1/2
                        text-xs font-bold px-2 py-1
                        rounded-md bg-white/60
                        hover:bg-[var(--light-green)]
                        cursor-pointer
                        '
                    >
                        {showPassword ? 'Hide' : 'Show'}
                    </button>
                )}
            </div>

            {error && (
                <span className='text-xs text-red-800'>{error}</span>
            )}
        </div>
    );
}