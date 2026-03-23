'use client';
import { useRouter } from 'next/navigation';
import BubbleButton from '@/components/ui/BubbleButton';

export default function Navbar() {
    const router = useRouter();

    return (
        <header>
            <nav className='fixed top-0 left-0 w-full z-50 bg-transparent'>
                <div className='max-w-8xl mx-auto px-6 md:px-10 lg:px-12 py-5 flex justify-between items-center'>

                    {/* === Logo === */}
                    <div>
                        <p
                            className="text-[16px] md:text-[18px] lg:text-[20px] arcade font-bold outline-text cursor-pointer"
                            onClick={() => router.push('/')}
                        >
                            <span>Dungeons</span>
                            <span className="block lg:inline"> & Tasks</span>
                        </p>
                    </div>

                    {/* === Links === */}
                    <div className='flex gap-4'>
                        <BubbleButton onClick={() => router.push('/login')}>
                            Login
                        </BubbleButton>

                        <BubbleButton onClick={() => router.push('/signup')}>
                            Register
                        </BubbleButton>
                    </div>
                </div>
            </nav>
        </header>
    );
}