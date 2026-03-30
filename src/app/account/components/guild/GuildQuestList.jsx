'use client';
import React, { useState, useEffect } from 'react';
import BubbleButton from '@/components/ui/BubbleButton';
import Modal from '../ui/Modal';
import IconButton from '../ui/IconButton';
import { WarningIcon, MessageIcon } from '../ui/Icons';

export default function GuildQuestsList({ initialQuests, pendingReviewQuests = [], isMaster, guildId, members = [], parties = [], onRefresh, onApproveComplete, onRevise }) {
    const [quests, setQuests] = useState(initialQuests || []);

    useEffect(() => {
        setQuests(initialQuests || []);
    }, [initialQuests]);
    const [showModal, setShowModal] = useState(false);

    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [rewardCoins, setRewardCoins] = useState(10);
    const [rewardXp, setRewardXp] = useState(10);

    const [assignType, setAssignType] = useState('none');
    const [selectedUser, setSelectedUser] = useState('');
    const [selectedParty, setSelectedParty] = useState('');

    const [editingQuest, setEditingQuest] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);

    const [editTitle, setEditTitle] = useState('');
    const [editDesc, setEditDesc] = useState('');
    const [editRewardCoins, setEditRewardCoins] = useState(10);
    const [editRewardXp, setEditRewardXp] = useState(10);
    const [editAssignType, setEditAssignType] = useState('none');
    const [editSelectedUser, setEditSelectedUser] = useState('');
    const [editSelectedParty, setEditSelectedParty] = useState('');

    const [expandedQuests, setExpandedQuests] = useState({});

    const [showReviseModal, setShowReviseModal] = useState(false);
    const [currentReviseQuest, setCurrentReviseQuest] = useState(null);
    const [reviseNote, setReviseNote] = useState('');

    const [showBlockViewModal, setShowBlockViewModal] = useState(false);
    const [currentBlockQuest, setCurrentBlockQuest] = useState(null);
    const [showRevisionViewModal, setShowRevisionViewModal] = useState(false);
    const [currentRevisionQuest, setCurrentRevisionQuest] = useState(null);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [questToDelete, setQuestToDelete] = useState(null);

    const toggleExpand = (questId) => {
        setExpandedQuests(prev => ({
            ...prev,
            [questId]: !prev[questId]
        }));
    };

    const getMemberName = (userId) => {
        const member = members.find(m => m.id === userId);
        return member ? `${member.first_name} ${member.last_name}` : null;
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'available':
                return {
                    bg: 'var(--status-available-bg)',
                    text: 'var(--status-available)',
                    label: 'Available'
                };
            case 'assigned':
                return {
                    bg: 'var(--status-assigned-bg)',
                    text: 'var(--status-assigned)',
                    label: 'Assigned'
                };
            case 'in_progress':
                return {
                    bg: 'var(--status-in-progress-bg)',
                    text: 'var(--status-in-progress)',
                    label: 'In Progress'
                };
            case 'blocked':
                return {
                    bg: 'var(--status-blocked-bg)',
                    text: 'var(--status-blocked)',
                    label: 'Blocked'
                };
            case 'pending_review':
                return {
                    bg: 'var(--status-pending-review-bg)',
                    text: 'var(--status-pending-review)',
                    label: 'Pending Review'
                };
            case 'completed':
                return {
                    bg: 'var(--status-completed-bg)',
                    text: 'var(--status-completed)',
                    label: 'Completed'
                };
            default:
                return {
                    bg: '#f3f4f6',
                    text: '#6b7280',
                    label: status
                };
        }
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

    const handleOpenEdit = (quest) => {
        setEditingQuest(quest);
        setEditTitle(quest.title);
        setEditDesc(quest.description || '');
        setEditRewardCoins(quest.reward_coins);
        setEditRewardXp(quest.reward_xp);
        if (quest.context_type === 'party' && quest.party_id) {
            setEditAssignType('party');
            setEditSelectedParty(String(quest.party_id));
            setEditSelectedUser('');
        } else if (quest.assigned_to) {
            setEditAssignType('user');
            setEditSelectedUser(quest.assigned_to);
            setEditSelectedParty('');
        } else {
            setEditAssignType('none');
            setEditSelectedUser('');
            setEditSelectedParty('');
        }
        setShowEditModal(true);
    };

    const handleUpdate = async () => {
        if (!editTitle.trim()) return;
        if (editAssignType === 'party' && !editSelectedParty) return console.warn('Select a party to assign');

        const updateData = {
            questId: editingQuest.id,
            title: editTitle,
            description: editDesc,
            reward_coins: editRewardCoins,
            reward_xp: editRewardXp,
            assigned_to: editAssignType === 'user' ? editSelectedUser : null,
            context_type: editAssignType === 'party' ? 'party' : 'guild',
            party_id: editAssignType === 'party' ? editSelectedParty : null
        };
        console.log('Updating quest with:', updateData);

        try {
            const res = await fetch('/api/quest/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to update quest');
            }

            setShowEditModal(false);
            setEditingQuest(null);
            if (onRefresh) onRefresh();

        } catch (err) {
            console.log('Failed to update quest:', err.message);
        }
    };

    const handleDelete = () => {
        setQuestToDelete(editingQuest);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        try {
            const res = await fetch('/api/quest/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ questId: questToDelete.id }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to delete quest');
            }

            setShowDeleteModal(false);
            setQuestToDelete(null);
            setShowEditModal(false);
            setEditingQuest(null);
            if (onRefresh) onRefresh();

        } catch (err) {
            console.log('Failed to delete quest:', err.message);
        }
    };

    const openReviseModal = (quest) => {
        setCurrentReviseQuest(quest);
        setReviseNote('');
        setShowReviseModal(true);
    };

    const handleReviseSubmit = () => {
        if (currentReviseQuest && onRevise) {
            onRevise(currentReviseQuest.id, reviseNote);
        }
        setShowReviseModal(false);
        setCurrentReviseQuest(null);
        setReviseNote('');
    };

    const handleApproveComplete = (questId) => {
        if (onApproveComplete) {
            onApproveComplete(questId);
        }
    };

    const openBlockViewModal = (quest) => {
        setCurrentBlockQuest(quest);
        setShowBlockViewModal(true);
    };

    const openRevisionViewModal = (quest) => {
        setCurrentRevisionQuest(quest);
        setShowRevisionViewModal(true);
    };

    const activeQuests = quests.filter(q => q.status !== 'completed');
    const completedQuests = quests.filter(q => q.status === 'completed');

    return (
        <div>
            <div className='flex justify-between items-center'>
                <h3 className='font-semibold'>Guild Quests</h3>
                {isMaster && <button onClick={() => setShowModal(true)} className='text-[var(--dark-green)] cursor-pointer hover:text-green-600 font-bold'>+ Add</button>}
            </div>

            {/* Pending Review Section */}
            {isMaster && pendingReviewQuests.length > 0 && (
                <div className='mt-4 p-3 border-2 border-purple-400 rounded-lg bg-purple-50'>
                    <h4 className='font-semibold text-purple-700 mb-2'>
                        Pending Review ({pendingReviewQuests.length})
                    </h4>
                    <div className='flex flex-col gap-2'>
                        {pendingReviewQuests.map(q => (
                            <div key={q.id} className='border p-3 rounded bg-white'>
                                <div className='flex justify-between items-start'>
                                    <div className='flex-1'>
                                        <p className='font-medium mb-1'>{q.title}</p>
                                        <div className='flex items-center gap-2'>
                                            {q.context_type === 'party' && q.party_name && (
                                                <span className='text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded'>
                                                    Party: {q.party_name}
                                                </span>
                                            )}
                                            <span 
                                                className='text-xs px-2 py-0.5 rounded font-medium'
                                                style={{ 
                                                    backgroundColor: 'var(--status-pending-review-bg)', 
                                                    color: 'var(--status-pending-review)' 
                                                }}
                                            >
                                                Pending Review
                                            </span>
                                        </div>
                                        <p className='text-sm text-gray-600 mt-1'>
                                            Completed by: {getMemberName(q.assigned_to) || 'Unknown'}
                                        </p>
                                        <div className='flex items-center gap-1 mt-1'>
                                            <span className='text-xs'>
                                                Reward: {q.reward_coins} coins • {q.reward_xp} XP
                                            </span>
                                            {q.block_reason && (
                                                <IconButton 
                                                    icon={<WarningIcon />}
                                                    onClick={() => openBlockViewModal(q)}
                                                    title='View Block Reason'
                                                    color='red'
                                                    size='sm'
                                                />
                                            )}
                                        </div>
                                    </div>
                                    <div className='flex flex-col gap-1 ml-2'>
                                        <BubbleButton 
                                            onClick={() => openReviseModal(q)}
                                            variant='yellow'
                                            className='bg-orange-500 hover:bg-orange-600 text-white text-xs'
                                        >
                                            Revise
                                        </BubbleButton>
                                        <BubbleButton 
                                            onClick={() => handleApproveComplete(q.id)}
                                            variant='green'
                                            className='bg-green-500 hover:bg-green-600 text-white text-xs'
                                        >
                                            Approve
                                        </BubbleButton>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Active Quests */}
            <div className='mt-2 flex flex-col gap-2'>
                {activeQuests.length ? activeQuests.map(q => {
                    const assigneeName = getMemberName(q.assigned_to);
                    const MAX_DESCRIPTION_LENGTH = 80;
                    const isLongDescription = q.description && q.description.length > MAX_DESCRIPTION_LENGTH;
                    const displayDescription = isLongDescription && !expandedQuests[q.id]
                        ? q.description.substring(0, MAX_DESCRIPTION_LENGTH) + '...'
                        : q.description;
                    const statusStyle = getStatusStyles(q.status);

                    return (
                        <div 
                            key={q.id} 
                            className='border p-2 rounded relative bg-white'
                        >
                            <div className='flex justify-between items-start'>
                                <div className='flex-1'>
                                    <p className='font-medium mb-1'>{q.title}</p>
                                    <div className='flex items-center gap-2 mb-1'>
                                        {q.context_type === 'party' && q.party_name && (
                                            <span className='text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded'>
                                                Party: {q.party_name}
                                            </span>
                                        )}
                                        <span 
                                            className='text-xs px-2 py-0.5 rounded font-medium'
                                            style={{ 
                                                backgroundColor: statusStyle.bg, 
                                                color: statusStyle.text 
                                            }}
                                        >
                                            {statusStyle.label}
                                        </span>
                                    </div>
                                    {assigneeName && (
                                            <span className='text-xs text-gray-600'>
                                                Assigned to: {assigneeName}
                                            </span>
                                        )}
                                    <p className='text-sm'>{displayDescription}</p>
                                    {isLongDescription && (
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleExpand(q.id);
                                            }}
                                            className='text-xs text-blue-500 hover:text-blue-700 mt-1'
                                        >
                                            {expandedQuests[q.id] ? 'Show less' : 'Show more'}
                                        </button>
                                    )}
                                    <div className='flex items-center gap-1 mt-1'>
                                        <span className='text-xs text-gray-500'>
                                            Coins: {q.reward_coins} • XP: {q.reward_xp}
                                        </span>
                                        {q.block_reason && (
                                            <IconButton 
                                                icon={<WarningIcon />}
                                                onClick={() => openBlockViewModal(q)}
                                                title='View Block Reason'
                                                color='red'
                                                size='sm'
                                            />
                                        )}
                                        {q.revision_note && (
                                            <IconButton 
                                                icon={<MessageIcon />}
                                                onClick={() => openRevisionViewModal(q)}
                                                title='View Feedback'
                                                color='orange'
                                                size='sm'
                                            />
                                        )}
                                    </div>
                                </div>
                                {isMaster && (
                                    <BubbleButton 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleOpenEdit(q);
                                        }}
                                        className='text-xs ml-2'
                                    >
                                        Edit
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
                            <div key={q.id} className='border p-2 rounded bg-gray-50 relative opacity-60 group flex justify-between items-start'>
                                <div>
                                    <p className='font-medium line-through'>{q.title}</p>
                                    <p className='text-xs text-gray-500'>
                                        Coins: {q.reward_coins} • XP: {q.reward_xp}
                                    </p>
                                </div>
                                {isMaster && (
                                    <button 
                                        onClick={() => {
                                            setQuestToDelete(q);
                                            setShowDeleteModal(true);
                                        }}
                                        className='opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 text-sm px-2 py-1'
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Create Quest Modal */}
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
                        <label className='text-sm font-medium mb-1'>Reward Coins (max 20)</label>
                        <input
                            type='number'
                            value={rewardCoins}
                            onChange={(e) => setRewardCoins(Math.min(20, Math.max(0, Number(e.target.value))))}
                            max='20'
                            min='0'
                            className='border p-1 w-full'
                        />
                    </div>
                    <div className='flex flex-col w-1/2'>
                        <label className='text-sm font-medium mb-1'>Reward XP (max 20)</label>
                        <input
                            type='number'
                            value={rewardXp}
                            onChange={(e) => setRewardXp(Math.min(20, Math.max(0, Number(e.target.value))))}
                            max='20'
                            min='0'
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

            {/* Edit Quest Modal */}
            <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)}>
                <h2 className='font-bold text-lg mb-2'>Edit Quest</h2>

                <label className='text-sm font-medium mb-1 block'>Quest Title</label>
                <input
                    placeholder='Title'
                    className='border p-1 w-full mb-2'
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                />

                <label className='text-sm font-medium mb-1 block'>Description</label>
                <textarea
                    placeholder='Description'
                    className='border p-1 w-full mb-2'
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                />

                <div className='flex gap-2 mb-2'>
                    <div className='flex flex-col w-1/2'>
                        <label className='text-sm font-medium mb-1'>Reward Coins (max 20)</label>
                        <input
                            type='number'
                            value={editRewardCoins}
                            onChange={(e) => setEditRewardCoins(Math.min(20, Math.max(0, Number(e.target.value))))}
                            max='20'
                            min='0'
                            className='border p-1 w-full'
                        />
                    </div>
                    <div className='flex flex-col w-1/2'>
                        <label className='text-sm font-medium mb-1'>Reward XP (max 20)</label>
                        <input
                            type='number'
                            value={editRewardXp}
                            onChange={(e) => setEditRewardXp(Math.min(20, Math.max(0, Number(e.target.value))))}
                            max='20'
                            min='0'
                            className='border p-1 w-full'
                        />
                    </div>
                </div>

                <label className='text-sm font-medium mb-1 block'>Assign Quest</label>
                <select
                    className='border p-1 w-full mb-2'
                    value={editAssignType}
                    onChange={(e) => {
                        setEditAssignType(e.target.value);
                        if (e.target.value === 'none') {
                            setEditSelectedUser('');
                            setEditSelectedParty('');
                        }
                    }}
                >
                    <option value='none'>Unassigned (Guild Open)</option>
                    <option value='user'>Assign to Member</option>
                    <option value='party'>Assign to Party</option>
                </select>

                {editAssignType === 'user' && (
                    <div className='mb-2'>
                        <label className='text-sm font-medium mb-1 block'>Select Member</label>
                        {members.length ? (
                            <select
                                className='border p-1 w-full'
                                onChange={(e) => setEditSelectedUser(e.target.value)}
                                value={editSelectedUser}
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

                {editAssignType === 'party' && (
                    <div className='mb-4'>
                        <label className='text-sm font-medium mb-1 block'>Select Party</label>
                        {parties.length ? (
                            <select
                                className='border p-1 w-full'
                                onChange={(e) => setEditSelectedParty(e.target.value ? String(e.target.value) : '')}
                                value={editSelectedParty}
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

                <div className='flex gap-2'>
                    <BubbleButton 
                        onClick={handleDelete}
                        variant='red'
                        className='bg-red-500 hover:bg-red-600 text-white'
                    >
                        Delete Quest
                    </BubbleButton>
                    <BubbleButton onClick={handleUpdate} disabled={!editTitle.trim() || (editAssignType === 'party' && !editSelectedParty)}>
                        Save Changes
                    </BubbleButton>
                </div>

            </Modal>

            {/* Revise Modal */}
            <Modal isOpen={showReviseModal} onClose={() => setShowReviseModal(false)}>
                <h2 className='font-bold text-lg mb-2'>Revise Quest</h2>
                <p className='text-sm text-gray-600 mb-3'>What needs to be fixed?</p>
                
                <textarea
                    placeholder='Enter revision notes...'
                    value={reviseNote}
                    onChange={(e) => setReviseNote(e.target.value)}
                    className='w-full border p-2 rounded min-h-[100px]'
                />
                
                <div className='flex gap-2 mt-4'>
                    <BubbleButton 
                        onClick={handleReviseSubmit}
                        variant='green'
                        className='bg-orange-500 hover:bg-orange-600 text-white'
                    >
                        Send Back
                    </BubbleButton>
                    <BubbleButton onClick={() => setShowReviseModal(false)} variant='red'>
                        Cancel
                    </BubbleButton>
                </div>
            </Modal>

            {/* Block Reason View Modal */}
            <Modal isOpen={showBlockViewModal} onClose={() => {
                setShowBlockViewModal(false);
                setCurrentBlockQuest(null);
            }}>
                <h2 className='font-bold text-lg mb-4 text-red-600'>Block Reason</h2>
                {currentBlockQuest?.block_reason && (
                    <div className='p-3 bg-red-50 rounded mb-4'>
                        <p className='text-gray-700'>{currentBlockQuest.block_reason}</p>
                    </div>
                )}
                <BubbleButton onClick={() => {
                    setShowBlockViewModal(false);
                    setCurrentBlockQuest(null);
                }} className='mt-4'>
                    Close
                </BubbleButton>
            </Modal>

            {/* Revision Note View Modal */}
            <Modal isOpen={showRevisionViewModal} onClose={() => {
                setShowRevisionViewModal(false);
                setCurrentRevisionQuest(null);
            }}>
                <h2 className='font-bold text-lg mb-4 text-orange-600'>Guild Master Feedback</h2>
                {currentRevisionQuest?.revision_note && (
                    <div className='p-3 bg-orange-50 rounded'>
                        <p className='text-gray-700'>{currentRevisionQuest.revision_note}</p>
                    </div>
                )}
                <BubbleButton onClick={() => {
                    setShowRevisionViewModal(false);
                    setCurrentRevisionQuest(null);
                }} className='mt-4'>
                    Close
                </BubbleButton>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
                <h2 className='font-bold text-lg mb-2'>Delete Quest?</h2>
                <p className='text-sm text-gray-600 mb-4'>
                    Are you sure you want to delete "{questToDelete?.title}"? This cannot be undone.
                </p>
                <div className='flex gap-2'>
                    <BubbleButton 
                        onClick={confirmDelete}
                        className='bg-red-500 hover:bg-red-600 text-white'
                    >
                        Delete
                    </BubbleButton>
                    <BubbleButton onClick={() => setShowDeleteModal(false)}>
                        Cancel
                    </BubbleButton>
                </div>
            </Modal>
        </div>
    );
}
