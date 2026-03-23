'use client';

export default function BubbleButton({ children, onClick }) {
    return (
        <button
        onClick={onClick}
        className='
        px-[15px] py-[5px] 
        bg-white/60 backdrop-blur-md 
        border-[2.5px] rounded-[12px] 
        hover:bg-[var(--light-green)] transition-all duration-300 
        cursor-pointer 
        text-[15px] font-bold'
        >
            {children}
        </button>
    );
}