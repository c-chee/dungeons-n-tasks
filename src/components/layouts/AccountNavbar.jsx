'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import BubbleButton from '@/components/ui/BubbleButton';

export default function AccountNavbar() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleLogout = async () => {
        if (loading) return;
        setLoading(true);

        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include', // cookies
            });

            router.replace('/login');
            
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <header>
            <nav className='fixed top-0 left-0 w-full z-50 bg-transparent'>
                <div className='max-w-8xl mx-auto px-6 md:px-10 lg:px-12 py-5 flex justify-between items-center'>

                    {/* === Logo === */}
                    <div>
                        <p
                            className="text-[16px] md:text-[18px] lg:text-[20px] arcade font-bold outline-text cursor-pointer"
                            onClick={() => router.push('/account')}
                        >
                            <span>Dungeons</span>
                            <span className="block lg:inline"> & Tasks</span>
                        </p>
                    </div>

                    {/* === Links === */}
                    <div className='flex gap-4'>
                        <BubbleButton onClick={handleLogout} disabled={loading}>
                            {loading ? 'Logging out...' : 'Logout'}
                        </BubbleButton>
                    </div>
                    
                </div>
            </nav>
        </header>
    );
}