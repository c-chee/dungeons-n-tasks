'use client';
import { useState, useEffect, useRef } from 'react';

export default function Roles() {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef();

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.3 }
        );
        
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    const roles = [
        { term: 'Quests', meaning: 'Tasks turned into missions' },
        { term: 'Members', meaning: 'Players who complete quests' },
        { term: 'Guild Masters', meaning: 'Parents who manage quests' },
        { term: 'Parties', meaning: 'Teams within a guild' },
        { term: 'Guilds', meaning: 'Family units led by Guild Masters' },
    ];

    return (
        <section ref={ref} className='w-full py-10 -mt-[15em] lg:-mt-[18em] px-6 overflow-hidden'>
            <div className='max-w-6xl mx-auto'>
                
                {/* Slide-in image - above billboard, moves freely */}
                <div 
                    className={`
                        w-[12em] lg:w-[15em] pb-[2em] transition-transform duration-1000 ease-out
                        ${isVisible ? 'translate-x-0' : '-translate-x-full'}
                    `}
                >
                    <img 
                        src='/images/cat.png' 
                        alt=''
                        className='w-full'
                    />
                </div>
                
                {/* Billboard frame - centered */}
                <div className='bg-[var(--cream)] border-4 border-[var(--dark-brown)] rounded-lg p-6 lg:p-8'>
                    <h2 className='arcade text-3xl lg:text-3xl font-bold text-center text-[var(--dark-brown)] mb-8 border-b-2 py-4'>
                        ROLES
                    </h2>
                    
                    {/* Cards grid */}
                    <div className='grid grid-cols-1 lg:grid-cols-5 gap-4'>
                        {roles.map((role, index) => (
                            <div 
                                key={index}
                                className='bg-[var(--dark-brown)]/20 border border-[var(--dark-brown)] rounded-lg p-4'
                            >
                                <h3 className='arcade text-xl text-[var(--dark-brown)] mb-1'>
                                    {role.term}
                                </h3>
                                <p className='text-[var(--dark-brown)]/90 text-sm'>
                                    {role.meaning}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}