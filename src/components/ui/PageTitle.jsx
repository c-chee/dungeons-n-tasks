'use client'

export default function PageTitle({
    children,
    className = '',
    }) {

    return (
        <h3 className={`arcade text-[30px] md:text-[20px] lg:text-[30px] font-bold ${className}`} >
            {children}
        </h3>
    );
}