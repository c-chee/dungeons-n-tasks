'use client';

export default function Shop() {
    return (
        <div className='flex flex-col items-center justify-center min-h-full py-10 mt-[5em] md:mt-[9em] lg:mt-[10em]'>
            <img 
                src='/images/cat.png' 
                alt='Shop coming soon'
                className='w-[12em] md:w-[15em] lg:w-[18em] h-auto mb-8'
            />
            <h1 className='arcade outline-text-brown text-4xl text-white text-center'>
                Shop Coming Soon!
            </h1>
        </div>
    );
}
