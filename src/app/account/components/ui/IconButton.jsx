export default function IconButton({ 
    icon, 
    onClick, 
    title,
    variant = 'outlined',
    color = 'gray',
    size = 'sm',
    className = '' 
}) {
    const sizeClasses = {
        sm: 'w-6 h-6',
        md: 'w-8 h-8',
        lg: 'w-10 h-10'
    };

    const colorClasses = {
        red: 'text-[var(--icon-red)] hover:bg-[var(--icon-red-hover)]',
        orange: 'text-[var(--icon-orange)] hover:bg-[var(--icon-orange-hover)]',
        blue: 'text-[var(--icon-blue)] hover:bg-[var(--icon-blue-hover)]',
        green: 'text-[var(--icon-green)] hover:bg-[var(--icon-green-hover)]',
        gray: 'text-[var(--icon-gray)] hover:bg-[var(--icon-gray-hover)]'
    };

    const variantClasses = variant === 'solid' ? 'fill-current' : 'stroke-current';

    return (
        <button
            onClick={onClick}
            title={title}
            className={`flex items-center justify-center rounded transition-colors ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
        >
            <span className={variantClasses}>
                {icon}
            </span>
        </button>
    );
}
