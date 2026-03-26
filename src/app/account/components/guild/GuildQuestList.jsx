'use client';
import React, { useState } from 'react';
import BubbleButton from '@/components/ui/BubbleButton';
import Modal from '../ui/Modal';

export default function GuildQuestsList({ initialQuests, isMaster, guildId, members = [], parties = [] }) {
    const [quests, setQuests] = useState(initialQuests || []);
    const [showModal, setShowModal] = useState(false);

    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [rewardCoins, setRewardCoins] = useState(10);
    const [rewardXp, setRewardXp] = useState(10);

    const [assignType, setAssignType] = useState('none'); // none | user | party
    const [selectedUser, setSelectedUser] = useState('');
    const [selectedParty, setSelectedParty] = useState('');

    const handleCreate = async () => {
        // Basic validation
        if (!title.trim()) return alert('Quest title is required');

        if (assignType === 'user' && !selectedUser) return alert('Select a member to assign');
        if (assignType === 'party' && !selectedParty) return alert('Select a party to assign');

        try {
            const res = await fetch('/api/quest/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    description: desc,
                    context_type: assignType === 'party' ? 'party' : 'guild',
                    guild_id: assignType === 'party' ? null : guildId, // always send guildId for guild quests
                    party_id: assignType === 'party' ? selectedParty : null,
                    reward_coins: rewardCoins,
                    reward_xp: rewardXp,
                    assigned_to: assignType === 'user' ? selectedUser : null
                }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Failed to create quest');

            // Add quest locally
            setQuests([...quests, {
                id: data.id,
                title,
                description: desc,
                reward_coins: rewardCoins,
                reward_xp: rewardXp,
                assigned_to: assignType === 'user' ? selectedUser : null,
            }]);

            // Reset form
            setShowModal(false);
            setTitle('');
            setDesc('');
            setRewardCoins(10);
            setRewardXp(10);
            setAssignType('none');
            setSelectedUser('');
            setSelectedParty('');

        } catch (err) {
            console.error('Failed to create quest:', err.message);
            alert(err.message);
        }
    };

    return (
        <div>
            <div className='flex justify-between items-center'>
                <h3 className='font-semibold'>Guild Quests</h3>
                {isMaster && <BubbleButton onClick={() => setShowModal(true)}>+ Add</BubbleButton>}
            </div>

            {/* Quest List */}
            <div className='mt-2 flex flex-col gap-2'>
                {quests.length ? quests.map(q => (
                    <div key={q.id} className='border p-2 rounded relative'>
                        <p className='font-medium'>{q.title}</p>
                        <p className='text-sm'>{q.description}</p>
                        <p className='text-xs text-gray-500'>
                            Coins: {q.reward_coins} • XP: {q.reward_xp} 
                            {q.assigned_to && ` • Assigned to ID: ${q.assigned_to}`}
                        </p>
                    </div>
                )) : <p className='text-sm text-gray-500'>No quests available</p>}
            </div>

            {/* Modal */}
            <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
                <h2 className='font-bold text-lg mb-2'>Create Quest</h2>

                {/* Title */}
                <label className='text-sm font-medium mb-1 block'>Quest Title</label>
                <input
                    placeholder='Title'
                    className='border p-1 w-full mb-2'
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />

                {/* Description */}
                <label className='text-sm font-medium mb-1 block'>Description</label>
                <textarea
                    placeholder='Description'
                    className='border p-1 w-full mb-2'
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                />

                {/* Rewards */}
                <div className='flex gap-2 mb-2'>
                    <div className='flex flex-col w-1/2'>
                        <label className='text-sm font-medium mb-1'>Reward Coins</label>
                        <input
                            type='number'
                            value={rewardCoins}
                            onChange={(e) => setRewardCoins(Number(e.target.value))}
                            className='border p-1 w-full'
                        />
                    </div>
                    <div className='flex flex-col w-1/2'>
                        <label className='text-sm font-medium mb-1'>Reward XP</label>
                        <input
                            type='number'
                            value={rewardXp}
                            onChange={(e) => setRewardXp(Number(e.target.value))}
                            className='border p-1 w-full'
                        />
                    </div>
                </div>

                {/* Assign Type */}
                <label className='text-sm font-medium mb-1 block'>Assign Quest</label>
                <select
                    className='border p-1 w-full mb-2'
                    value={assignType}
                    onChange={(e) => setAssignType(e.target.value)}
                >
                    <option value='none'>Unassigned (Guild Open)</option>
                    <option value='user'>Assign to Member</option>
                    <option value='party'>Assign to Party</option>
                </select>

                {/* Assign Member */}
                {assignType === 'user' && (
                    <div className='mb-2'>
                        <label className='text-sm font-medium mb-1 block'>Select Member</label>
                        {members.length ? (
                            <select
                                className='border p-1 w-full'
                                onChange={(e) => setSelectedUser(e.target.value)}
                                value={selectedUser}
                            >
                                <option value=''>Select Member</option>
                                {members.map(m => (
                                    <option key={m.id} value={m.id}>
                                        {m.first_name} {m.last_name}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <p className='text-sm text-gray-500'>No members available</p>
                        )}
                    </div>
                )}

                {/* Assign Party */}
                {assignType === 'party' && (
                    <div className='mb-2'>
                        <label className='text-sm font-medium mb-1 block'>Select Party</label>
                        {parties.length ? (
                            <select
                                className='border p-1 w-full'
                                onChange={(e) => setSelectedParty(e.target.value)}
                                value={selectedParty}
                            >
                                <option value=''>Select Party</option>
                                {parties.map(p => (
                                    <option key={p.id} value={p.id}>
                                        {p.name}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <p className='text-sm text-gray-500'>No parties available</p>
                        )}
                    </div>
                )}

                <BubbleButton
                    onClick={handleCreate}
                    disabled={
                        !title.trim() ||
                        (assignType === 'user' && !selectedUser) ||
                        (assignType === 'party' && !selectedParty)
                    }
                >
                    Create Quest
                </BubbleButton>

            </Modal>
        </div>
    );
}