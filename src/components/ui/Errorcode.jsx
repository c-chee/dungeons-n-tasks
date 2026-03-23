'use client'
import { useRouter } from 'next/navigation';
import Button from './BubbleButton'

export default function ErrorCode({
    children,
    className = ''
}) {
    const router = useRouter();

    return (
        <div className={`flex flex-col place-items-center h-screen w-full bg-[url("/images/cat-confused.png")] bg-cover bg-center ${className}`}>

            <div className='
                flex flex-col 
                items-center justify-center 
                h-full 
                px-6 md:px-10 lg:px-12
                -mt-[5em] md:-mt-[6em] lg:-mt-[9em]'
            >
                <h3 className='arcade font-semibold text-[35px] lg:text-[40px]'>{children}</h3>

                <p className='text-[18px] max-w-[30em] font-[600] pb-8 '>Page not found!</p>

                <Button onClick={() => router.push('/')}>Return to home</Button>   
            </div>
            

        </div>
    );
}