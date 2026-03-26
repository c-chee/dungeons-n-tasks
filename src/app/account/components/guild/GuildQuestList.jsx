'use client';
import React, { useState } from 'react';
import BubbleButton from '@/components/ui/BubbleButton';

export default function GuildQuestList({ initialQuests, isMaster, guildId }) {
    const [quests, setQuests] = useState(initialQuests || []);

    const handleAddQuest = async () => {
        const title = prompt('Enter quest title:');
        const description = prompt('Enter quest description:');
        if (!title) return;

        const res = await fetch('/api/quests/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title,
                description,
                context_type: 'guild',
                guild_id: guildId,
                party_id: null,
            }),
        });

        if (res.ok) {
            const newQuest = await res.json();
            setQuests([...quests, { id: Date.now(), title, description }]); // temp add
        }
    };

    const handleRemoveQuest = async (questId) => {
        await fetch('/api/quests/remove', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ questId }),
        });
        setQuests(quests.filter(q => q.id !== questId));
    };

    return (
        <div>
            <div className='flex justify-between items-center mb-2'>
                <h3 className='font-semibold'>Guild Quests</h3>
                {isMaster && <BubbleButton onClick={handleAddQuest}>+ Add</BubbleButton>}
            </div>
            {quests.length ? (
                <div className='flex flex-col gap-2'>
                    {quests.map((q) => (
                        <div key={q.id} className='relative border p-2 rounded bg-white/50 flex justify-between items-center'>
                            <div>
                                <p className='font-semibold'>{q.title}</p>
                                <p className='text-sm'>{q.description}</p>
                            </div>
                            {isMaster && (
                                <button
                                    onClick={() => handleRemoveQuest(q.id)}
                                    className='absolute top-1 right-1 text-red-500 font-bold'
                                >
                                    X
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <p className='text-sm text-gray-500'>No current quests</p>
            )}
        </div>
    );
}