import AuthLayout from '@/components/forms/AuthLayout';

export const metadata = {
    title: 'Login',
};

export default function login() {
    return (
        <div className='
            flex flex-col w-screen min-h-screen 
            items-center justify-center bg-[var(--dark-green)]'
        >
            <AuthLayout />

        
        </div>
    )
}