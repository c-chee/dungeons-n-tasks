'use client';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

export default function AuthLayout() {
    const pathname = usePathname();
    const [isRegister, setIsRegister] = useState(false);
    const [fade, setFade] = useState(false);
    const [direction, setDirection] = useState('');
    const [isMobile, setIsMobile] = useState(false);

    // Detect mobile / small screens
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 900);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Handle route change
    useEffect(() => {
        const nextRegister = pathname === '/register';
        if (nextRegister !== isRegister) {
        if (!isMobile) {
            setDirection(nextRegister ? 'right' : 'left');
            setFade(true);
            const timeout = setTimeout(() => {
            setIsRegister(nextRegister);
            setFade(false);
            }, 250);
            return () => clearTimeout(timeout);
        } else {
            setIsRegister(nextRegister);
        }
        }
    }, [pathname, isMobile]);

    return (
        <div className='w-full h-screen flex items-center justify-center p-4'>
            <div className='relative w-full 
            max-w-[800px] min-h-[525px] rounded-[20px] overflow-hidden shadow-xl bg-[var(--brown)] border-[2.5px] backdrop-blur-lg flex'>

                {/* === Mobile: only active form === */}
                {isMobile ? (
                    <div className='w-full flex items-center justify-center'>
                        <div className='w-full max-w-[450px] px-6'>
                            {isRegister ? <RegisterForm /> : <LoginForm />}
                        </div>
                    </div>
                ) : (
                /* === Desktop: flex layout === */
                <>
                    {/* Swap order based on login/register */}
                    {isRegister ? (
                        <>
                            {/* Left: Register Form */}
                            <div className='w-1/2 flex items-center justify-center px-6'>
                                <RegisterForm />
                            </div>
                            {/* Right: Image */}
                            <div className='w-1/2 border-l-[2.5px] overflow-hidden'>
                                <img
                                    src='/images/cat-register.png'
                                    alt='D&T Register Cat'
                                    className='w-full h-full object-cover'
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Left: Image */}
                            <div className='w-1/2 border-r-[2.5px] overflow-hidden'>
                                <img
                                    src='/images/cat-register.png'
                                    alt='D&T Register Cat'
                                    className='w-full h-full object-cover'
                                />
                            </div>
                            {/* Right: Login Form */}
                            <div className='w-1/2 flex items-center justify-center px-6'>
                                <LoginForm />
                            </div>
                        </>
                    )}
                </>
                )}
            </div>
        </div>
    );
}