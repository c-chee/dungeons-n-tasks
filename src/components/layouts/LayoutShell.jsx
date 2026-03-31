'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import AccountNavbar from './AccountNavbar';
import Footer from './Footer';

export default function LayoutShell({ children }) {
    const pathname = usePathname();
    const isAccount = pathname.startsWith('/account');

    return (
        <>
            {isAccount ? <AccountNavbar /> : <Navbar />}

            <main className='flex-1 flex flex-col font-[var(--font-exo2)]'>
                {children}
            </main>

            {!isAccount && <Footer />}
        </>
    );
}