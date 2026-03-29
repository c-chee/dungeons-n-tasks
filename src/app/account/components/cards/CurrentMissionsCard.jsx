'use client';
import Card from './Card';
import BubbleButton from '@/components/ui/BubbleButton';

export default function CurrentMissionsCard({ quests }) {
  if (!quests || quests.length === 0) {
    return (
      <Card variant='default'>
        <h2 className='font-bold text-lg'>Current Missions</h2>
        <p className='text-sm text-gray-500 mt-2'>You have no active missions.</p>
      </Card>
    );
  }

  return (
    <Card variant='default'>
      <h2 className='font-bold text-lg'>Current Missions</h2>
      <div className='flex flex-col gap-3 mt-2'>
        {quests.map((quest) => (
          <div key={quest.id} className='flex justify-between items-center border p-2 rounded bg-white/50'>
            <div>
              <p className='font-semibold'>{quest.title}</p>
              <p className='text-sm'>{quest.description}</p>
              <p className='text-xs text-gray-600'>Reward: {quest.reward_coins} coins • {quest.reward_xp} XP</p>
            </div>
            {/* Optionally add a button to abandon or mark complete */}
            {quest.status === 'assigned' && (
              <BubbleButton onClick={() => console.log('Abandon quest', quest.id)}>
                Abandon
              </BubbleButton>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}