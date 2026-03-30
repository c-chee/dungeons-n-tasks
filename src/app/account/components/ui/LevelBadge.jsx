export default function LevelBadge({ level, level_xp }) {
    const xpToNextLevel = 100;
    const percentage = Math.min((level_xp / xpToNextLevel) * 100, 100);
    
    return (
        <div className='flex items-center gap-2'>
            <span className='font-semibold text-sm'>Lvl {level}</span>
            <div className='flex-1 max-w-[120px] bg-[var(--cream)] rounded-full h-2 border'>
                <div 
                    className='bg-[var(--dark-green)] h-[5.75px] rounded-full transition-all'
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <span className='text-xs text-gray-700'>{level_xp}/100</span>
        </div>
    );
}
