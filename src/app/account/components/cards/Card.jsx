'use client';

export default function Card({ children, variant = 'default' }) {

    const bgClass = {
        default: 'bg-white',
        blue: 'bg-[var(--light-blue)]',
        green: 'bg-green-50',
        blueDark: 'bg-blue-100',
        greenDark: 'bg-green-100',
    }[variant];

    return (
        <div className={`p-4 border rounded ${bgClass} shadow-sm`}>
            {children}
        </div>
    );
}