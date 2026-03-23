import Hero from '@/components/sections/Hero';
import About from '@/components/sections/About';

export default function Home() {
  return (
    <div className='flex flex-col w-screen min-h-screen items-center justify-start bg-[var(--dark-green)]'>
      <Hero />
      <About />
      <p className='h-[25em]'>Next section</p>
    </div>
  );
}
