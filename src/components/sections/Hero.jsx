'use client';
import { useRouter } from 'next/navigation';
import BubbleButton from '@/components/ui/BubbleButton';

export default function Hero() {
    const router = useRouter(); 
    
    return (
        
        <section className='h-screen w-full bg-[url("/images/cat-fishing.png")] bg-cover bg-center'>
            <div className='
                flex flex-col 
                items-center justify-center 
                h-full 
                px-6 md:px-10 lg:px-12
                -mt-[5em] md:-mt-[6em] lg:-mt-[9em]'
            >

                <h1 className='arcade outline-text text-center text-[25px] lg:text-[28px] font-bold text-[var(--dark-red)]'>Make Progress Feel Like a Game</h1>

                <p className='m-2 lg:m-4 text-[18px] max-w-[30em] font-[500]'>Create or join guilds, collaborate on shared goals, and keep each other accountable while leveling up in real life.</p>

                <p className='text-[16px] mt-[1em] md:mt-[2em] pb-[4px]'>Scroll to learn more or </p>

                <BubbleButton onClick={() => router.push('/register')}>
                    Start your adventure
                </BubbleButton>

            </div>
        </section>
    );
}