'use client';

export default function Toast({ message, type = 'info', onClose }) {
    const bgColors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500',
        warning: 'bg-yellow-500',
    };

    const icons = {
        success: '✓',
        error: '✕',
        info: 'ℹ',
        warning: '⚠',
    };

    return (
        <div className={`${bgColors[type]} text-white px-4 py-3 rounded shadow-lg flex items-center gap-3 min-w-[250px] max-w-[350px] animate-slide-in`}>
            <span className='text-lg'>{icons[type]}</span>
            <span className='flex-1'>{message}</span>
            <button
                onClick={onClose}
                className='text-white/80 hover:text-white font-bold text-lg'
            >
                ×
            </button>
        </div>
    );
}
