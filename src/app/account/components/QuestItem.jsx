export default function QuestItem({ quest }) {

    async function acceptQuest() {
        await fetch('/api/quest/accept', {
        method: 'POST',
        body: JSON.stringify({ questId: quest.id }),
        });

        window.location.reload();
    }

    return (
        <div className='border p-3 mb-2 rounded'>

            <h3 className='font-bold'>{quest.title}</h3>
            <p>{quest.description}</p>

            <p>Reward: {quest.reward_coins} coins</p>

            {quest.status === 'available' && (
                <button onClick={acceptQuest}>
                Accept Quest
                </button>
            )}

        </div>
    );
}