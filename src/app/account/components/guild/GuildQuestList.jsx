'use client';
import React, { useState } from 'react';
import BubbleButton from '@/components/ui/BubbleButton';
import Modal from '../ui/Modal';

export default function GuildQuestsList({ initialQuests, isMaster, guildId, members = [], parties = [], onRefresh }) {
    const [quests, setQuests] = useState(initialQuests || []);
    const [showModal, setShowModal] = useState(false);

    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [rewardCoins, setRewardCoins] = useState(10);
    const [rewardXp, setRewardXp] = useState(10);

    const [assignType, setAssignType] = useState('none');
    const [selectedUser, setSelectedUser] = useState('');
    const [selectedParty, setSelectedParty] = useState('');

    const getMemberName = (userId) => {
        const member = members.find(m => m.id === userId);
        return member ? `${member.first_name} ${member.last_name}` : null;
    };

    const handleCreate = async () => {
        if (!title.trim()) return console.warn('Quest title is required');
        if (assignType === 'user' && !selectedUser) return console.warn('Select a member to assign');
        if (assignType === 'party' && !selectedParty) return console.warn('Select a party to assign');

        try {
            const res = await fetch('/api/quest/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    description: desc,
                    context_type: assignType === 'party' ? 'party' : 'guild',
                    guild_id: assignType === 'party' ? null : guildId,
                    party_id: assignType === 'party' ? selectedParty : null,
                    reward_coins: rewardCoins,
                    reward_xp: rewardXp,
                    assigned_to: assignType === 'user' ? selectedUser : null
                }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Failed to create quest');

            setShowModal(false);
            setTitle('');
            setDesc('');
            setRewardCoins(10);
            setRewardXp(10);
            setAssignType('none');
            setSelectedUser('');
            setSelectedParty('');

            if (onRefresh) onRefresh();

        } catch (err) {
            console.log('Failed to create quest:', err.message);
        }
    };

    const handleComplete = async (questId) => {
        try {
            const res = await fetch('/api/quest/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ questId }),
            });

            const data = await res.json();

            if (!res.ok) {
                console.log(data.error || 'Failed to complete quest');
                return;
            }

            if (onRefresh) onRefresh();

        } catch (err) {
            console.log('Failed to complete quest:', err.message);
        }
    };

    const activeQuests = quests.filter(q => q.status !== 'completed');
    const completedQuests = quests.filter(q => q.status === 'completed');

    return (
        <div>
            <div className='flex justify-between items-center'>
                <h3 className='font-semibold'>Guild Quests</h3>
                {isMaster && <BubbleButton onClick={() => setShowModal(true)}>+ Add</BubbleButton>}
            </div>

            {/* Active Quests */}
            <div className='mt-2 flex flex-col gap-2'>
                {activeQuests.length ? activeQuests.map(q => {
                    const assigneeName = getMemberName(q.assigned_to);
                    return (
                        <div key={q.id} className='border p-2 rounded relative'>
                            <div className='flex justify-between items-start'>
                                <div className='flex-1'>
                                    <p className='font-medium'>{q.title}</p>
                                    <p className='text-sm'>{q.description}</p>
                                    <p className='text-xs text-gray-500'>
                                        Coins: {q.reward_coins} • XP: {q.reward_xp}
                                        {assigneeName && ` • Assigned to: ${assigneeName}`}
                                        {!q.assigned_to && q.status === 'available' && ' • Unassigned'}
                                    </p>
                                </div>
                                {isMaster && q.status === 'assigned' && (
                                    <BubbleButton 
                                        onClick={() => handleComplete(q.id)}
                                        className='ml-2 bg-green-500 hover:bg-green-600 text-white text-xs'
                                    >
                                        Complete
                                    </BubbleButton>
                                )}
                            </div>
                        </div>
                    );
                }) : <p className='text-sm text-gray-500'>No active quests</p>}
            </div>

            {/* Completed Quests */}
            {completedQuests.length > 0 && (
                <div className='mt-4'>
                    <h4 className='text-sm font-medium text-gray-500'>Completed</h4>
                    <div className='flex flex-col gap-1 mt-1'>
                        {completedQuests.map(q => (
                            <div key={q.id} className='border p-2 rounded bg-gray-50 relative opacity-60'>
                                <p className='font-medium line-through'>{q.title}</p>
                                <p className='text-xs text-gray-500'>
                                    Coins: {q.reward_coins} • XP: {q.reward_xp}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
                <h2 className='font-bold text-lg mb-2'>Create Quest</h2>

                <label className='text-sm font-medium mb-1 block'>Quest Title</label>
                <input
                    placeholder='Title'
                    className='border p-1 w-full mb-2'
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />

                <label className='text-sm font-medium mb-1 block'>Description</label>
                <textarea
                    placeholder='Description'
                    className='border p-1 w-full mb-2'
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                />

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