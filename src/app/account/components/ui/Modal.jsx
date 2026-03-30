'use client';

export default function Modal({ isOpen, onClose, children }) {
    if (!isOpen) return null;

    return (
        <div 
            className='fixed inset-0 bg-black/40 flex items-center justify-center z-50'
            onClick={onClose}
        >
            <div 
                className='bg-white p-4 rounded shadow-lg w-full max-w-md relative'
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className='absolute top-2 right-2 text-red-500 font-bold'
                >
                    X
                </button>

                {children}
            </div>
        </div>
    );
}