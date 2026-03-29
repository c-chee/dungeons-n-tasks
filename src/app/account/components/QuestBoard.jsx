'use client';

import React, { useState, useEffect } from 'react';
import Card from './cards/Card';
import BubbleButton from '@/components/ui/BubbleButton';
import Modal from './ui/Modal';
import { useToast } from './ui/ToastProvider';

const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
    </svg>
);

const WaitingIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
    </svg>
);

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6"/>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    </svg>
);

export default function QuestBoard({ data, onRefresh }) {
    const { showToast } = useToast();
    const { guild, party, quests, user } = data || {};
    const isGuildMaster = guild?.role === 'guild_master';

    const allQuests = quests?.availableQuests || [];
    const activeQuests = allQuests.filter(q => q.status !== 'completed');
    const completedQuests = allQuests.filter(q => q.status === 'completed');
    
    const pickupRequests = quests?.pickupRequests || [];
    const userPendingRequests = quests?.userPendingRequests || [];

    const [selectedQuest, setSelectedQuest] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [questToDelete, setQuestToDelete] = useState(null);

    const getStatusBadge = (quest) => {
        if (quest.status === 'completed') {
            return { bg: '#e5e7eb', text: '#6b7280', label: 'Completed' };
        }
        if (quest.status === 'available' && !quest.assigned_to) {
            return { bg: 'var(--status-available-bg)', text: 'var(--status-available)', label: 'Available' };
        }
        if (quest.assigned_to) {
            return { bg: 'var(--status-available-bg)', text: 'var(--status-available)', label: 'Assigned' };
        }
        return { bg: '#f3f4f6', text: '#6b7280', label: quest.status };
    };

    const hasUserRequested = (questId) => {
        return userPendingRequests.some(r => r.quest_id === questId);
    };

    const isCreator = (quest) => {
        return quest.created_by === user?.id;
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
            if (!res.ok) throw new Error('Failed to cancel request');
            showToast('Request cancelled', 'success');
            if (onRefresh) onRefresh();
        } catch (err) {
            showToast(err.message, 'error');
        }
    };

    const handleAcceptRequest = async (requestId) => {
        try {
            const res = await fetch('/api/quest/pickup/accept', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requestId }),
            });
            if (!res.ok) {
                const result = await res.json();
                throw new Error(result.error);
            }
            showToast('Quest assigned successfully!', 'success');
            if (onRefresh) onRefresh();
        } catch (err) {
            showToast(err.message, 'error');
        }
    };

    const handleDeclineRequest = async (requestId) => {
        try {
            const res = await fetch('/api/quest/pickup/decline', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requestId }),
            });
            if (!res.ok) throw new Error('Failed to decline request');
            showToast('Request declined', 'success');
            if (onRefresh) onRefresh();
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

    const canUserPickup = (quest) => {
        if (quest.status !== 'available') return false;
        if (quest.assigned_to) return false;
        if (hasUserRequested(quest.id)) return false;
        if (userPendingRequests.length >= 3) return false;
        return true;
    };

    const renderQuestCard = (quest, isCompleted = false) => {
        const status = getStatusBadge(quest);
        const userRequested = hasUserRequested(quest.id);
        const canPickup = canUserPickup(quest);
        const assignedName = quest.assigned_first_name 
            ? `${quest.assigned_first_name} ${quest.assigned_last_name}`
            : null;
        const creatorName = quest.creator_first_name
            ? `${quest.creator_first_name} ${quest.creator_last_name}`
            : null;

        return (
            <div 
                key={quest.id} 
                className={`border p-4 rounded bg-white hover:shadow-md transition-shadow cursor-pointer ${
                    isCompleted ? 'opacity-60 bg-gray-50' : ''
                }`}
                onClick={() => openQuestDetail(quest)}
            >
                <div className='flex justify-between items-start mb-2'>
                    <h3 className={`font-semibold ${isCompleted ? 'line-through text-gray-500' : ''}`}>
                        {quest.title}
                    </h3>
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
                    <span className='text-gray-400'>
                        {quest.context_type === 'guild' ? 'Guild Quest' : 'Party Quest'}
                    </span>
                </div>

                {creatorName && !isCompleted && (
                    <p className='text-xs text-gray-400 mb-2'>Created by: {creatorName}</p>
                )}

                {assignedName && (
                    <div className='flex items-center gap-1 text-xs text-blue-600 mb-2'>
                        <UserIcon />
                        <span>Assigned to: {assignedName}</span>
                    </div>
                )}

                {quest.requesters && !isCompleted && (
                    <div className='flex items-center gap-1 text-xs text-orange-600 mb-2'>
                        <WaitingIcon />
                        <span>Waiting: {quest.requesters}</span>
                    </div>
                )}

                {isCompleted && isGuildMaster && (
                    <button
                        onClick={(e) => openDeleteConfirm(quest, e)}
                        className='flex items-center gap-1 text-xs text-red-500 hover:text-red-700 mt-2'
                    >
                        <TrashIcon />
                        <span>Remove from board</span>
                    </button>
                )}

                {!isCompleted && (
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
                                {quest.assigned_to ? 'Unavailable' : userPendingRequests.length >= 3 ? 'Max Requests' : 'Pick-up'}
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
                <h2 className='font-bold text-lg mb-4'>Quest Board</h2>

                {activeQuests.length === 0 && completedQuests.length === 0 ? (
                    <p className='text-sm text-gray-500'>No quests available.</p>
                ) : (
                    <>
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

            {isGuildMaster && pickupRequests.length > 0 && (
                <Card variant='default'>
                    <h2 className='font-bold text-lg mb-4'>Pickup Requests</h2>
                    <div className='space-y-3'>
                        {pickupRequests.map(request => (
                            <div key={request.id} className='border p-3 rounded bg-gray-50'>
                                <div className='flex justify-between items-start'>
                                    <div>
                                        <h4 className='font-medium'>{request.quest_title}</h4>
                                        <div className='flex items-center gap-2 mt-1'>
                                            <span className='text-sm text-gray-600'>
                                                {request.first_name} {request.last_name}
                                            </span>
                                            <span className='text-xs text-gray-400'>
                                                Level {request.user_level}
                                            </span>
                                        </div>
                                    </div>
                                    <div className='flex gap-2'>
                                        <BubbleButton 
                                            onClick={() => handleAcceptRequest(request.id)}
                                            className='bg-green-500 hover:bg-green-600 text-white text-xs'
                                        >
                                            Accept
                                        </BubbleButton>
                                        <BubbleButton 
                                            onClick={() => handleDeclineRequest(request.id)}
                                            className='bg-gray-400 hover:bg-gray-500 text-white text-xs'
                                        >
                                            Decline
                                        </BubbleButton>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {!isGuildMaster && userPendingRequests.length > 0 && (
                <Card variant='default'>
                    <h2 className='font-bold text-lg mb-4'>My Requests</h2>
                    <div className='space-y-2'>
                        {userPendingRequests.map(request => {
                            const quest = allQuests.find(q => q.id === request.quest_id);
                            return (
                                <div key={request.id} className='border p-2 rounded bg-gray-50 flex justify-between items-center'>
                                    <span className='text-sm'>{quest?.title || 'Unknown Quest'}</span>
                                    <button 
                                        onClick={() => handleCancelRequest(request.quest_id)}
                                        className='text-xs text-red-500 hover:text-red-700 underline'
                                    >
                                        Cancel
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            )}

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
        </div>
    );
}
