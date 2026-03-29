export default function LevelBadge({ level, level_xp }) {
    const xpToNextLevel = 100;
    const percentage = Math.min((level_xp / xpToNextLevel) * 100, 100);
    
    return (
        <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">Lvl {level}</span>
            <div className="flex-1 max-w-[120px] bg-gray-200 rounded-full h-2">
                <div 
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <span className="text-xs text-gray-600">{level_xp}/100</span>
        </div>
    );
}
