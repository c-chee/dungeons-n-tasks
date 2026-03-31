'use client';

import React, { useState, useEffect } from 'react';
import Card from './cards/Card';
import BubbleButton from '@/components/ui/BubbleButton';
import Modal from './ui/Modal';
import { useToast } from './ui/ToastProvider';
import { UserIcon, WaitingIcon, TrashIcon } from './ui/Icons';

export default function QuestBoard({ data, onRefresh, onApproveComplete, onRevise }) {
    const { showToast } = useToast();
    const { guild, party, quests, user, guildParties } = data || {};
    const isGuildMaster = guild?.role === 'guild_master';

    const allQuests = quests?.availableQuests || [];
    const pickupRequests = quests?.pickupRequests || [];
    const userPendingRequests = quests?.userPendingRequests || [];

    const isUserInParty = (partyId) => {
        if (!partyId || !guildParties) return false;
        const partyData = guildParties.find(p => String(p.id) === String(partyId));
        if (!partyData?.members) return false;
        return partyData.members.some(m => String(m.user_id) === String(user?.id));
    };

    const isQuestVisible = (quest) => {
        if (quest.context_type === 'guild') return true;
        if (quest.context_type === 'party') {
            return isGuildMaster || isUserInParty(quest.party_id);
        }
        return false;
    };

    const visibleQuests = allQuests.filter(q => isQuestVisible(q));
    const activeQuests = visibleQuests.filter(q => q.status !== 'completed');
    const completedQuests = visibleQuests.filter(q => q.status === 'completed');
    const pendingReviewQuests = visibleQuests.filter(q => q.status === 'pending_review');

    const [selectedQuest, setSelectedQuest] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [questToDelete, setQuestToDelete] = useState(null);

    const [showReviseModal, setShowReviseModal] = useState(false);
    const [currentReviseQuest, setCurrentReviseQuest] = useState(null);
    const [reviseNote, setReviseNote] = useState('');

    const getStatusBadge = (quest) => {
        if (quest.status === 'completed') {
            return { bg: 'var(--status-completed-bg)', text: 'var(--status-completed)', label: 'Completed' };
        }
        if (quest.status === 'pending_review') {
            return { bg: 'var(--status-pending-review-bg)', text: 'var(--status-pending-review)', label: 'Pending Review' };
        }
        if (quest.status === 'in_progress') {
            return { bg: 'var(--status-in-progress-bg)', text: 'var(--status-in-progress)', label: 'In Progress' };
        }
        if (quest.status === 'blocked') {
            return { bg: 'var(--status-blocked-bg)', text: 'var(--status-blocked)', label: 'Blocked' };
        }
        if (quest.status === 'assigned') {
            return { bg: 'var(--status-assigned-bg)', text: 'var(--status-assigned)', label: 'Assigned' };
        }
        if (!quest.assigned_to) {
            return { bg: 'var(--status-available-bg)', text: 'var(--status-available)', label: 'Available' };
        }
        return { bg: '#f3f4f6', text: '#6b7280', label: quest.status };
    };

    const hasUserRequested = (questId) => {
        return userPendingRequests.some(r => r.quest_id === questId);
    };

    const handlePickup = async (questId) => {
        try {
            const res = await fetch('/api/quest/pickup/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ questId }),
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.error);
            showToast('Quest pickup request sent!', 'success');
            if (onRefresh) onRefresh();
        } catch (err) {
            showToast(err.message, 'error');
        }
    };

    const handleCancelRequest = async (questId) => {
        try {
            const res = await fetch('/api/quest/pickup/cancel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ questId }),
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.error);
            showToast('Pickup request cancelled', 'success');
            if (onRefresh) onRefresh();
        } catch (err) {
            showToast(err.message, 'error');
        }
    };

    const handleApproveComplete = async (questId) => {
        try {
            if (onApproveComplete) {
                onApproveComplete(questId);
            }
        } catch (err) {
            showToast(err.message, 'error');
        }
    };

    const openQuestDetail = (quest) => {
        setSelectedQuest(quest);
        setShowDetailModal(true);
    };

    const openDeleteConfirm = (quest, e) => {
        e?.stopPropagation();
        setQuestToDelete(quest);
        setShowDeleteModal(true);
    };

    const handleDeleteQuest = async () => {
        if (!questToDelete) return;
        try {
            const res = await fetch('/api/quest/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ questId: questToDelete.id }),
            });
            if (!res.ok) {
                const result = await res.json();
                throw new Error(result.error || 'Failed to delete quest');
            }
            showToast('Quest removed from board', 'success');
            setShowDeleteModal(false);
            setQuestToDelete(null);
            if (onRefresh) onRefresh();
        } catch (err) {
            showToast(err.message, 'error');
        }
    };

    const openReviseModal = (quest, e) => {
        e?.stopPropagation();
        setCurrentReviseQuest(quest);
        setReviseNote('');
        setShowReviseModal(true);
    };

    const handleReviseSubmit = () => {
        if (!reviseNote.trim()) {
            showToast('Please enter feedback', 'error');
            return;
        }
        if (onRevise) {
            onRevise(currentReviseQuest.id, reviseNote);
        }
        setShowReviseModal(false);
        setCurrentReviseQuest(null);
        setReviseNote('');
    };

    const canUserPickup = (quest) => {
        if (quest.status !== 'available') return { allowed: false, reason: 'Quest not available' };
        if (quest.assigned_to) return { allowed: false, reason: 'Quest already assigned' };
        if (hasUserRequested(quest.id)) return { allowed: false, reason: 'Request already sent' };
        if (userPendingRequests.length >= 3) return { allowed: false, reason: 'Max requests reached' };
        if (quest.party_id && !isUserInParty(quest.party_id)) {
            return { allowed: false, reason: 'Party members only' };
        }
        return { allowed: true, reason: '' };
    };

    const getMemberName = (userId) => {
        if (!guildParties) return null;
        for (const party of guildParties) {
            const member = party.members?.find(m => m.user_id === userId);
            if (member) return `${member.first_name} ${member.last_name}`;
        }
        return null;
    };

    const renderQuestCard = (quest, isCompleted = false) => {
        const status = getStatusBadge(quest);
        const userRequested = hasUserRequested(quest.id);
        const pickupCheck = canUserPickup(quest);
        const canPickup = pickupCheck.allowed;
        const pickupReason = pickupCheck.reason;
        const assignedName = quest.assigned_first_name 
            ? `${quest.assigned_first_name} ${quest.assigned_last_name}`
            : null;
        const creatorName = quest.creator_first_name
            ? `${quest.creator_first_name} ${quest.creator_last_name}`
            : null;
        const isPendingReview = quest.status === 'pending_review';

        return (
            <div 
                key={quest.id} 
                className={`border p-4 rounded bg-white hover:shadow-md transition-shadow cursor-pointer ${
                    isCompleted ? 'opacity-60 bg-gray-50' : ''
                } ${isPendingReview ? 'border-purple-400' : ''}`}
                onClick={() => openQuestDetail(quest)}
            >
                <div className='flex justify-between items-start mb-2'>
                    <div className='flex items-center gap-2 flex-wrap'>
                        <h3 className={`font-semibold ${isCompleted ? 'line-through text-gray-500' : ''}`}>
                            {quest.title}
                        </h3>
                        {quest.context_type === 'party' && quest.party_name && (
                            <span className='text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded'>
                                Party: {quest.party_name}
                            </span>
                        )}
                    </div>
                    <span 
                        className='text-xs px-2 py-0.5 rounded font-medium'
                        style={{ 
                            backgroundColor: status.bg, 
                            color: status.text 
                        }}
                    >
                        {status.label}
                    </span>
                </div>

                <p className={`text-sm text-gray-600 mb-2 line-clamp-2 ${isCompleted ? 'line-through' : ''}`}>
                    {quest.description || 'No description'}
                </p>

                <div className='flex items-center gap-3 text-xs text-gray-500 mb-2'>
                    <span>{quest.reward_coins} coins</span>
                    <span>{quest.reward_xp} XP</span>
                    {quest.context_type === 'guild' && (
                        <span className='text-gray-400'>Guild Quest</span>
                    )}
                </div>

                {assignedName && (
                    <div className='flex items-center gap-1 text-xs text-blue-600 mb-2'>
                        <UserIcon />
                        <span>Assigned to: {assignedName}</span>
                    </div>
                )}

                {quest.requesters && !isCompleted && !isPendingReview && (
                    <div className='flex items-center gap-1 text-xs text-orange-600 mb-2'>
                        <WaitingIcon />
                        <span>Waiting: {quest.requesters}</span>
                    </div>
                )}

                {isGuildMaster && (
                    <div onClick={e => e.stopPropagation()} className='mt-2'>
                        {isPendingReview ? (
                            <div className='flex gap-2 flex-wrap'>
                                <BubbleButton 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleApproveComplete(quest.id);
                                    }}
                                    className='bg-green-500 hover:bg-green-600 text-white text-xs'
                                >
                                    Approve
                                </BubbleButton>
                                <BubbleButton 
                                    onClick={(e) => openReviseModal(quest, e)}
                                    className='bg-orange-500 hover:bg-orange-600 text-white text-xs'
                                >
                                    Revise
                                </BubbleButton>
                            </div>
                        ) : isCompleted ? (
                            <button
                                onClick={(e) => openDeleteConfirm(quest, e)}
                                className='flex items-center gap-1 text-xs text-red-500 hover:text-red-700'
                            >
                                <TrashIcon />
                                <span>Remove</span>
                            </button>
                        ) : null}
                    </div>
                )}

                {!isGuildMaster && !isCompleted && !isPendingReview && (
                    <div onClick={e => e.stopPropagation()}>
                        {userRequested ? (
                            <div className='flex gap-2 mt-2'>
                                <span className='text-xs text-green-600 font-medium'>Request sent</span>
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleCancelRequest(quest.id);
                                    }}
                                    className='text-xs text-red-500 hover:text-red-700 underline'
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <BubbleButton 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handlePickup(quest.id);
                                }}
                                disabled={!canPickup}
                                className={`mt-2 text-xs ${canPickup ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                            >
                                {canPickup ? 'Pick-up' : pickupReason}
                            </BubbleButton>
                        )}
                    </div>
                )}
            </div>
        );
    };

    if (!guild && !party) {
        return (
            <Card variant='default'>
                <h2 className='font-bold text-lg'>Quest Board</h2>
                <p className='text-sm text-gray-500 mt-2'>Join a guild or party to see available quests.</p>
            </Card>
        );
    }

    return (
        <div className='space-y-6'>
            <Card variant='default'>
                <div className='text-center mb-4'>
                    <p className='arcade text-sm text-[var(--dark-brown)] mb-[2px]'>{guild?.name || 'Guild'}</p>
                    <h2 className='arcade outline-text-brown text-[var(--yellow)] text-xl font-bold'>Guild Quest</h2>
                </div>

                {activeQuests.length === 0 && completedQuests.length === 0 && pendingReviewQuests.length === 0 ? (
                    <p className='text-sm text-gray-500'>No quests available.</p>
                ) : (
                    <>
                        {pendingReviewQuests.length > 0 && (
                            <div className='mb-6'>
                                <h3 className='font-semibold text-purple-700 mb-3 text-sm'>
                                    Pending Review ({pendingReviewQuests.length})
                                </h3>
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                    {pendingReviewQuests.map(quest => renderQuestCard(quest, false))}
                                </div>
                            </div>
                        )}

                        {activeQuests.length > 0 && (
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
                                {activeQuests.map(quest => renderQuestCard(quest, false))}
                            </div>
                        )}

                        {completedQuests.length > 0 && (
                            <div>
                                <h3 className='font-semibold text-gray-500 mb-3 text-sm'>
                                    Completed ({completedQuests.length})
                                </h3>
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                    {completedQuests.map(quest => renderQuestCard(quest, true))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </Card>

            <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)}>
                {selectedQuest && (
                    <>
                        <h2 className={`font-bold text-lg mb-4 ${selectedQuest.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                            {selectedQuest.title}
                        </h2>
                        
                        <div className='mb-4'>
                            <p className='text-sm font-medium text-gray-500'>Status</p>
                            <span 
                                className='inline-block mt-1 px-2 py-1 rounded text-xs font-medium'
                                style={{ 
                                    backgroundColor: getStatusBadge(selectedQuest).bg, 
                                    color: getStatusBadge(selectedQuest).text 
                                }}
                            >
                                {getStatusBadge(selectedQuest).label}
                            </span>
                        </div>

                        <div className='mb-4'>
                            <p className='text-sm font-medium text-gray-500'>Description</p>
                            <p className={`text-gray-700 mt-1 ${selectedQuest.status === 'completed' ? 'line-through' : ''}`}>
                                {selectedQuest.description || 'No description'}
                            </p>
                        </div>

                        <div className='mb-4'>
                            <p className='text-sm font-medium text-gray-500'>Rewards</p>
                            <p className='text-gray-700 mt-1'>
                                {selectedQuest.reward_coins} coins • {selectedQuest.reward_xp} XP
                            </p>
                        </div>

                        <div className='mb-4'>
                            <p className='text-sm font-medium text-gray-500'>Quest Type</p>
                            <p className='text-gray-700 mt-1'>
                                {selectedQuest.context_type === 'guild' ? 'Guild Quest' : 'Party Quest'}
                            </p>
                        </div>

                        {selectedQuest.creator_first_name && (
                            <div className='mb-4'>
                                <p className='text-sm font-medium text-gray-500'>Created By</p>
                                <p className='text-gray-700 mt-1'>
                                    {selectedQuest.creator_first_name} {selectedQuest.creator_last_name}
                                </p>
                            </div>
                        )}

                        {selectedQuest.assigned_first_name && (
                            <div className='mb-4'>
                                <p className='text-sm font-medium text-gray-500'>Assigned To</p>
                                <p className='text-gray-700 mt-1'>
                                    {selectedQuest.assigned_first_name} {selectedQuest.assigned_last_name}
                                </p>
                            </div>
                        )}

                        {selectedQuest.requesters && (
                            <div className='mb-4'>
                                <p className='text-sm font-medium text-orange-500'>Waiting</p>
                                <p className='text-gray-700 mt-1'>{selectedQuest.requesters}</p>
                            </div>
                        )}

                        <div className='mt-4'>
                            <BubbleButton onClick={() => setShowDetailModal(false)}>
                                Close
                            </BubbleButton>
                        </div>
                    </>
                )}
            </Modal>

            <Modal isOpen={showDeleteModal} onClose={() => {
                setShowDeleteModal(false);
                setQuestToDelete(null);
            }}>
                <h2 className='font-bold text-lg mb-4 text-red-600'>Remove Quest?</h2>
                <p className='text-gray-600 mb-2'>
                    Are you sure you want to remove <strong>"{questToDelete?.title}"</strong> from the board?
                </p>
                <p className='text-sm text-gray-500 mb-4'>
                    This will permanently delete the quest and cannot be undone.
                </p>
                <div className='flex gap-2'>
                    <BubbleButton 
                        onClick={handleDeleteQuest}
                        className='bg-red-500 hover:bg-red-600 text-white'
                    >
                        Remove
                    </BubbleButton>
                    <BubbleButton onClick={() => {
                        setShowDeleteModal(false);
                        setQuestToDelete(null);
                    }}>
                        Cancel
                    </BubbleButton>
                </div>
            </Modal>

            <Modal isOpen={showReviseModal} onClose={() => {
                setShowReviseModal(false);
                setCurrentReviseQuest(null);
                setReviseNote('');
            }}>
                <h2 className='font-bold text-lg mb-4 text-orange-600'>Revise Quest</h2>
                <p className='text-sm text-gray-600 mb-3'>
                    Provide feedback for <strong>{currentReviseQuest?.title}</strong>
                </p>
                
                <textarea
                    placeholder='Enter feedback for the quest assignee...'
                    value={reviseNote}
                    onChange={(e) => setReviseNote(e.target.value)}
                    className='w-full border p-2 rounded min-h-[100px]'
                />
                
                <div className='flex gap-2 mt-4'>
                    <BubbleButton 
                        onClick={handleReviseSubmit}
                        className='bg-orange-500 hover:bg-orange-600 text-white'
                    >
                        Send Back
                    </BubbleButton>
                    <BubbleButton onClick={() => {
                        setShowReviseModal(false);
                        setCurrentReviseQuest(null);
                        setReviseNote('');
                    }}>
                        Cancel
                    </BubbleButton>
                </div>
            </Modal>
        </div>
    );
}
