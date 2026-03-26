import { Work_Sans, Share_Tech_Mono, Exo_2 } from 'next/font/google';
import './globals.css';

// === Components ===
import LayoutShell from '@/components/layouts/LayoutShell';
import { ToastProvider } from './account/components/ui/ToastProvider';

// === Fonts === 
const workSans = Work_Sans({
  subsets: ['latin'],
  weight: ['400','500','600','700'],
  variable: '--font-work',
});

const shareTechMono = Share_Tech_Mono({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-share-mono',
});

const exo2 = Exo_2({
  subsets: ['latin'],
  weight: ['400','500','600','700'],
  variable: '--font-exo2',
});


// === Data ===
export const metadata = {
  title: {
    default: 'Dungeons & Tasks',
    template: '%s | D&T',
  },
  description: '...',
};

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <body className={`${workSans.className} ${shareTechMono.className} ${exo2.className} antialiased flex flex-col min-h-screen`}>
        <ToastProvider>
          <LayoutShell>
            {children}
          </LayoutShell>
        </ToastProvider>
      </body>
    </html>
  );
}
