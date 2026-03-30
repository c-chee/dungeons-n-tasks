'use client';

export default function RoleRadioButton({ value, checked, onChange, label, description }) {
    return (
        <label 
            className={`
                flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all w-full
                ${checked 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-[var(--brown)] bg-white hover:bg-gray-50'}
            `}
        >
            <input
                type='radio'
                value={value}
                checked={checked}
                onChange={onChange}
                className='hidden'
            />
            <div className={`
                w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0
                ${checked ? 'border-green-500' : 'border-[var(--brown)]'}
            `}>
                {checked && (
                    <div className='w-2.5 h-2.5 rounded-full bg-green-500' />
                )}
            </div>
            <div className='text-left'>
                <span className={`font-medium block ${checked ? 'text-green-700' : 'text-gray-700'}`}>
                    {label}
                </span>
                {description && (
                    <p className='text-xs text-gray-500'>{description}</p>
                )}
            </div>
        </label>
    );
}
