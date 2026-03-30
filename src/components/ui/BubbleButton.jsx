'use client';

export default function BubbleButton({ children, onClick, disabled = false, variant = 'default' }) {
    const hoverClasses = {
        default: 'hover:bg-[var(--light-green)]',
        red: 'hover:bg-red-200',
        yellow: 'hover:bg-yellow-200',
        blue: 'hover:bg-[var(--status-available-bg)]',
        green: 'hover:bg-green-200'
    };
    
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`
                px-[15px] py-[5px] 
                bg-white/60 backdrop-blur-md 
                border-[2.25px] border-[var(--dark-brown)] rounded-[12px] 
                ${hoverClasses[variant] || hoverClasses.default}
                transition-all duration-300 
                cursor-pointer 
                text-[15px] font-bold
                ${disabled ? 'opacity-50 cursor-not-allowed hover:bg-white/60' : ''}
            `}
        >
            {children}
        </button>
    );
}