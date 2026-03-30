import Roles from './Roles';

export default function About() {
    return (
        <section className='min-h-screen w-full -mt-40 bg-[url("/images/field-bg.png")] bg-auto bg-no-repeat bg-top pt-[23em] lg:pt-[30em]'>
            <div className='flex flex-col lg:flex-row items-center justify-center h-full px-6 lg:px-12 py-20 -mt-[5em] lg:-mt-[9em] gap-5 max-w-7xl mx-auto'>
                
                <div className='w-full lg:w-1/2 mb-8 lg:mb-0 text-center lg:text-left order-1 lg:order-2'>
                    <h2 className='arcade text-3xl lg:text-4xl font-bold text-white mb-4'>
                        Turn Tasks into Adventures
                    </h2>
                    <p className='text-white/90 text-lg leading-relaxed'>
                        Dungeons & Tasks transforms everyday tasks into exciting quests. 
                        Complete missions, earn rewards, and level up while building good habits. 
                        Whether you&apos;re a parent managing family chores or a child looking for adventure, 
                        this app makes productivity feel like play.
                    </p>
                </div>
                
                <div className='w-full lg:w-1/2 flex justify-center order-2 lg:order-1'>
                    <img 
                        src='/images/guild.png' 
                        alt='Dungeons and Tasks'
                        className='max-w-md w-full rounded-lg shadow-lg'
                    />
                </div>
            </div>

            <Roles />
        </section>
    );
}