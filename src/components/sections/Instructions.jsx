'use client';
import { useState, useEffect, useRef } from 'react';

export default function Instructions() {
    const [isVisible, setIsVisible] = useState(false);
    const [cardVisible, setCardVisible] = useState([false, false, false, false]);
    const ref = useRef();
    const cardRefs = useRef([]);

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

    useEffect(() => {
        const observers = cardRefs.current.map((cardRef, index) => {
            const observer = new IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting) {
                        setTimeout(() => {
                            setCardVisible(prev => {
                                const newVis = [...prev];
                                newVis[index] = true;
                                return newVis;
                            });
                        }, index * 100);
                        observer.disconnect();
                    }
                },
                { threshold: 0.3 }
            );
            if (cardRef) observer.observe(cardRef);
            return observer;
        });
        return () => observers.forEach(o => o.disconnect());
    }, []);

    const howItWorksSteps = [
        { term: 'Join', meaning: 'Join or create a Guild' },
        { term: 'Quest', meaning: 'Complete tasks as quests' },
        { term: 'Level Up', meaning: 'Earn XP and rewards' },
        { term: 'Team Up', meaning: 'Work together in Parties' },
    ];

    const guildMasterSteps = [
        { step: 1, title: 'Create Guild', desc: 'Set up your guild and invite members' },
        { step: 2, title: 'Create Quests', desc: 'Build tasks for your team to complete' },
        { step: 3, title: 'Review Progress', desc: 'Check pickup requests and completions' },
        { step: 4, title: 'Reward', desc: 'Approve and award XP to members' },
    ];

    const memberSteps = [
        { step: 1, title: 'Join Guild', desc: 'Enter a guild code to join' },
        { step: 2, title: 'Pick Up Quests', desc: 'Browse and request available quests' },
        { step: 3, title: 'Complete Tasks', desc: 'Finish tasks and submit for review' },
        { step: 4, title: 'Earn Rewards', desc: 'Get coins and XP when approved' },
    ];

    return (
        <section ref={ref} className='w-full py-10 px-6 overflow-hidden bg-[var(--dark-green)]'>
            <div className='max-w-6xl mx-auto'>
                
                {/* HOW IT WORKS Section */}
                <div className='lg:p-8 mb-12'>
                    <h2 className='arcade outline-text-brown text-2xl lg:text-3xl font-bold text-center text-white mb-8 py-2'>
                        - HOW IT WORKS -
                    </h2>
                    
                    {/* 2-column layout: text left, image right on lg; stacked on mobile */}
                    <div className='flex flex-col lg:grid lg:grid-cols-2 lg:gap-6'>
                        
                        {/* Left Column - Stacked Cards with staggered animation */}
                        <div className='flex flex-col text-center align-middle gap-4 order-2 lg:order-1'>
                            {howItWorksSteps.map((item, index) => (
                                <div 
                                    key={index}
                                    ref={el => cardRefs.current[index] = el}
                                    className={`
                                        bg-[var(--light-green)] border-2 border-[var(--dark-brown)] rounded-lg px-6 py-4 flex justify-between
                                        transition-all duration-500 ease-out
                                        ${cardVisible[index] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
                                    `}
                                    style={{ transitionDelay: cardVisible[index] ? '0ms' : `${index * 100}ms` }}
                                >
                                    <h3 className='arcade text-lg lg:text-xl text-[var(--dark-brown)] mb-1'>
                                        {item.term}
                                    </h3>
                                    <p className='text-[var(--dark-brown)] text-[15px] md:text-[17px] lg:text-[19px] font-semibold'>
                                        {item.meaning}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Right Column - Image with Wizard */}
                        <div className='relative h-[20em] lg:h-auto order-1 lg:order-2 mb-12 lg:mb-2'>
                            {/* Guild Image */}
                            <img 
                                src='/images/cat-register.png' 
                                alt='Guild'
                                className='w-full h-full object-cover rounded-lg border-2 border-[var(--dark-brown)]'
                            />
                            
                            {/* Wizard - Slides from right, flipped horizontally */}
                            <div 
                                className={`
                                    absolute right-0 w-[15em] lg:w-[20em] transition-transform duration-1000 ease-out z-10 -mt-[11em] lg:-mt-[13em]
                                    ${isVisible ? 'translate-x-0' : 'translate-x-full'}
                                    scale-x-[-1]
                                `}
                            >
                                <img 
                                    src='/images/grey-wizard.png' 
                                    alt=''
                                    className='w-full'
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Split Box - Guild Master vs Member */}
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                    {/* Guild Master Flow */}
                    <div className='bg-[var(--cream)] border-4 border-[var(--dark-brown)] rounded-lg p-6'>
                        <h3 className='arcade outline-text text-xl lg:text-2xl font-bold text-center text-[var(--dark-brown)] mb-6 pb-3 border-b-2'>
                            GUILD MASTER FLOW
                        </h3>
                        <div className='space-y-4'>
                            {guildMasterSteps.map((item) => (
                                <div key={item.step} className='flex items-start gap-4'>
                                    <div className='outline-text-brown bg-[var(--yellow)] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0 border-2 border-[var(--dark-brown)]'>
                                        {item.step}
                                    </div>
                                    <div>
                                        <h4 className='arcade text-lg text-[var(--dark-brown)]'>
                                            {item.title}
                                        </h4>
                                        <p className='text-[var(--dark-brown)]/80 text-sm'>
                                            {item.desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Member Flow */}
                    <div className='bg-[var(--cream)] border-4 border-[var(--dark-brown)] rounded-lg p-6'>
                        <h3 className='arcade outline-text text-xl lg:text-2xl font-bold text-center text-[var(--dark-brown)] mb-6 pb-3 border-b-2'>
                            MEMBER FLOW
                        </h3>
                        <div className='space-y-4'>
                            {memberSteps.map((item) => (
                                <div key={item.step} className='flex items-start gap-4'>
                                    <div className='outline-text-brown bg-[var(--yellow)] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0
                                    border-2 border-[var(--dark-brown)]'>
                                        {item.step}
                                    </div>
                                    <div>
                                        <h4 className='arcade text-lg text-[var(--dark-brown)]'>
                                            {item.title}
                                        </h4>
                                        <p className='text-[var(--dark-brown)]/80 text-sm'>
                                            {item.desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}
