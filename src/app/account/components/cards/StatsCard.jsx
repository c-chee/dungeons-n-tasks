import Card from './Card';
import BubbleButton from '@/components/ui/BubbleButton';
import LevelBadge from '../ui/LevelBadge';

export default function StatsCard({ coins, level, level_xp, guild, onLeave }) {
    return (
        <Card variant='default'>
            <h2 className='font-bold text-lg'>Your Stats</h2>
            <div className='flex items-center gap-4'>
                <p>Coins: {coins}</p>
                <LevelBadge level={level} level_xp={level_xp} />
            </div>

            {guild && (
                <div className="mt-4 p-2 border rounded bg-gray-50">
                    <h3 className="font-semibold">Guild: {guild.name}</h3>
                    <p className="text-sm text-gray-600">Role: {guild.role}</p>
                    {onLeave && (
                        <BubbleButton
                            onClick={onLeave}
                            className="mt-2 bg-red-500 text-white hover:bg-red-600"
                        >
                            Leave Guild
                        </BubbleButton>
                    )}
                </div>
            )}
        </Card>
    );
}