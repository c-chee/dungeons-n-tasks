'use client';

export default function Card({ children, variant = 'default' }) {

    const bgClass = {
        default: 'bg-[var(--cream)]',
        blue: 'bg-[var(--light-blue)]',
        green: 'bg-[var(--light-green)]',
        orange: 'bg-orange-100 border-orange-500',
        purple: 'bg-purple-100 border-purple-500',
        blueDark: 'bg-blue-100',
        greenDark: 'bg-green-100',
    }[variant];

    return (
        <div className={`p-4 border-2 rounded-lg ${bgClass} shadow-sm`}>
            {children}
        </div>
    );
}