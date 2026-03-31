import Hero from '@/components/sections/Hero';
import About from '@/components/sections/About';
import Instructions from '@/components/sections/Instructions';
import AI from '@/components/sections/AI';

export default function Home() {
  return (
    <div className='flex flex-col w-screen min-h-screen items-center justify-start bg-[var(--dark-green)]'>
      <Hero />
      <About />
      <Instructions />
      <AI />
    </div>
  );
}
