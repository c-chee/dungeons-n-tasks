'use client';
import React, { useState } from 'react';
import BubbleButton from '@/components/ui/BubbleButton';
import QuestItem from '../cards/QuestItem';

export default function GuildQuestsList({ initialQuests, isMaster, guildId }) {
    const [quests, setQuests] = useState(initialQuests || []);
    const [newQuestTitle, setNewQuestTitle] = useState('');
    const [newQuestDesc, setNewQuestDesc] = useState('');
    const [showForm, setShowForm] = useState(false);

    /** Add a new quest */
    const handleAddQuest = async () => {
        if (!newQuestTitle) return;

        try {
            const res = await fetch('/api/quest/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: newQuestTitle,
                    description: newQuestDesc,
                    context_type: 'guild',
                }),
            });

            const data = await res.json();

            console.log('API RESPONSE:', data);

            if (!res.ok) throw new Error(data.error || 'Failed to create quest');

            console.log('Quest created', data);

            // Update UI immediately
            setQuests([
                ...quests,
                {
                    id: Date.now(),
                    title: newQuestTitle,
                    description: newQuestDesc
                }
            ]);

            // Reset form
            setNewQuestTitle('');
            setNewQuestDesc('');
            setShowForm(false);

        } catch (err) {
            console.error('Failed to create quest:', err.message);
        }
    };

    /** Remove a quest */
    const handleRemoveQuest = async (questId) => {
        try {
            await fetch('/api/quest/remove', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ questId }),
            });
            setQuests(quests.filter(q => q.id !== questId));
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <h3 className="font-semibold flex justify-between items-center">
                Guild Quests
                {isMaster && <BubbleButton onClick={() => setShowForm(!showForm)}>+ Add</BubbleButton>}
            </h3>

            {/* Add Quest Form */}
            {showForm && isMaster && (
                <div className="flex flex-col gap-1 border p-2 rounded bg-gray-100">
                    <input
                        className="border p-1 rounded"
                        placeholder="Quest Title"
                        value={newQuestTitle}
                        onChange={(e) => setNewQuestTitle(e.target.value)}
                    />
                    <textarea
                        className="border p-1 rounded"
                        placeholder="Quest Description"
                        value={newQuestDesc}
                        onChange={(e) => setNewQuestDesc(e.target.value)}
                    />
                    <BubbleButton onClick={handleAddQuest}>Create Quest</BubbleButton>
                </div>
            )}

            {/* Quest List */}
            <div className="flex flex-col gap-1">
                {quests.length ? (
                    quests.map(q => (
                        <div key={q.id} className="border p-2 rounded relative bg-white/50 flex justify-between items-center">
                            <div>
                                <p className="font-medium">{q.title}</p>
                                <p className="text-sm text-gray-500">{q.description}</p>
                            </div>
                            {isMaster && (
                                <button
                                    className="absolute top-1 right-1 text-red-500 font-bold"
                                    onClick={() => handleRemoveQuest(q.id)}
                                >
                                    X
                                </button>
                            )}
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-gray-500">No guild quests</p>
                )}
            </div>
        </div>
    );
}