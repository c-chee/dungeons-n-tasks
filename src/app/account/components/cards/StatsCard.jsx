import Card from './Card';
import BubbleButton from '@/components/ui/BubbleButton';
import LevelBadge from '../ui/LevelBadge';

export default function StatsCard({ coins, level, level_xp, guild, onLeave, firstName, lastName }) {
    const userName = firstName && lastName ? `${firstName} ${lastName}` : null;
    
    return (
        <Card variant='blue'>
            <div className='flex items-center gap-4'>
                <img 
                    src='/images/temp-profile.png' 
                    alt='Profile picture'
                    className='w-20 sm:w-24 h-20 sm:h-24 rounded-[10px] border-[2px] border-[var(--dark-brown)]'
                />
                <div className='flex-1'>
                    {userName ? (
                        <>
                            <h2 className='arcade outline-text font-bold text-lg'>{userName}</h2>
                            <p className='text-sm text-gray-700'>Stats</p>
                        </>
                    ) : (
                        <h2 className='arcade outline-text font-bold text-lg'>Your Stats</h2>
                    )}
                    <div className='flex flex-col gap-1 mt-1'>
                        <LevelBadge level={level} level_xp={level_xp} />
                        <p className='font-semibold text-sm'>Coins: {coins}</p>
                    </div>
                </div>
            </div>

            {guild && (
                <div className='mt-4 p-2 border rounded bg-white'>
                    <h3 className='font-semibold'>Guild: {guild.name}</h3>
                    <p className='text-sm text-gray-700'>Role: {guild.role}</p>
                    {onLeave && guild.role !== 'guild_master' && (
                        <BubbleButton
                            onClick={onLeave}
                            className='mt-2 bg-red-500 text-white hover:bg-red-600'
                        >
                            Leave Guild
                        </BubbleButton>
                    )}
                </div>
            )}
        </Card>
    );
}