'use client';
import { useState, useEffect, useRef } from 'react';

export default function AI() {
    const [currentImage, setCurrentImage] = useState(0);
    const [cardVisible, setCardVisible] = useState([false, false, false]);
    const highlightsRef = useRef();
    const images = ['/images/ai-1.png', '/images/ai-2.png'];

    const nextImage = () => {
        setCurrentImage(prev => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setCurrentImage(prev => (prev - 1 + images.length) % images.length);
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImage(prev => (prev + 1) % images.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    highlights.forEach((_, index) => {
                        setTimeout(() => {
                            setCardVisible(prev => {
                                const newVis = [...prev];
                                newVis[index] = true;
                                return newVis;
                            });
                        }, index * 100);
                    });
                    observer.disconnect();
                }
            },
            { threshold: 0.3 }
        );
        
        if (highlightsRef.current) observer.observe(highlightsRef.current);
        return () => observer.disconnect();
    }, []);

    const highlights = [
        { title: 'Ask the Wizard', desc: 'Stuck on a quest? Get help from your AI wizard' },
        { title: 'Get Unstuck', desc: 'Receive helpful hints and solutions' },
        { title: 'Stay Motivated', desc: 'Get encouraging messages to keep going' },
    ];

    return (
        <section className='w-full py-20 px-6 bg-[var(--dark-green)]'>
            <div className='max-w-6xl mx-auto'>
                <div className='flex flex-col lg:flex-row items-center gap-12'>
                    
                    {/* Left - Images with flip controls */}
                    <div className='w-full lg:w-1/2 order-2 lg:order-1'>
                        <div className='relative flex flex-col items-center'>
                            <img 
                                src={images[currentImage]} 
                                alt={`AI Wizard ${currentImage + 1}`}
                                className='w-full max-w-sm sm:max-w-md mx-auto rounded-lg border-2 border-[var(--dark-brown)]'
                            />
                            {/* Arrow controls */}
                            <div className='flex items-center gap-4 mt-4'>
                                <button 
                                    onClick={prevImage}
                                    className='text-white hover:text-[var(--yellow)] text-2xl'
                                >
                                    ←
                                </button>
                                <span className='text-white text-sm'>
                                    {currentImage + 1} / {images.length}
                                </span>
                                <button 
                                    onClick={nextImage}
                                    className='text-white hover:text-[var(--yellow)] text-2xl'
                                >
                                    →
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    {/* Right - Text Content */}
                    <div className='w-full lg:w-1/2 order-1 lg:order-2 text-center lg:text-left'>
                        <h2 className='arcade outline-text-brown text-2xl lg:text-3xl text-[var(--purple)] outline-text leading-relaxed mb-4'>
                            Your AI Quest Wizard
                        </h2>
                        <p className='text-white text-lg mb-8'>
                            When you&apos;re stuck on a quest, the Wizard is here to help! 
                            Our AI-powered wizard provides encouraging guidance when you encounter blocks, 
                            keeping you motivated and on track.
                        </p>
                        
                        {/* Highlights with staggered animation */}
                        <div ref={highlightsRef} className='space-y-4 text-center lg:text-left'>
                            {highlights.map((item, index) => (
                                <div 
                                    key={index}
                                    className={`
                                        flex flex-col items-center lg:flex-row lg:items-start lg:gap-3 text-center lg:text-left
                                        boarder
                                        transition-all duration-500 ease-out
                                        ${cardVisible[index] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
                                    `}
                                    style={{ transitionDelay: cardVisible[index] ? '0ms' : `${index * 100}ms` }}
                                >
                                    <div>
                                        <h3 className='arcade text-[var(--yellow)] text-lg'>{item.title}</h3>
                                        <p className='text-white/80 text-md'>{item.desc}</p>
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
