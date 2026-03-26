'use client';

export default function BubbleButton({ children, onClick, disabled = false }) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`
                px-[15px] py-[5px] 
                bg-white/60 backdrop-blur-md 
                border-[2.5px] rounded-[12px] 
                hover:bg-[var(--light-green)] transition-all duration-300 
                cursor-pointer 
                text-[15px] font-bold
                ${disabled ? 'opacity-50 cursor-not-allowed hover:bg-white/60' : ''}
            `}
        >
            {children}
        </button>
    );
}