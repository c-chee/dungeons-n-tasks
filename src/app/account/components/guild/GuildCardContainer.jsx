'use client';
import React, { useState } from 'react';
import GuildQuestsList from './GuildQuestList';
import PartyCreationModal from '../ui/PartyCreationModal';
import MembersList from './MembersList';
import GuildCodeCard from './GuildCodeCard';
import GuildPartiesList from './GuildPartiesList';
import Card from '../cards/Card';
import BubbleButton from '@/components/ui/BubbleButton';
import { useToast } from '../ui/ToastProvider';

export default function GuildContainer({ guild, guildQuests, guildRequests, guildMembers, guildParties, user, onRemoveMember, onRefresh, pendingReviewQuests = [], partyQuests = [], partyPendingReviewQuests = [], pickupRequests = [], userPendingRequests = [], onApproveComplete, onRevise }) {
    const { showToast } = useToast();
    const isMaster = guild?.role === 'guild_master';
    const [joinCode, setJoinCode] = useState(guild?.join_code || '');

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingParty, setEditingParty] = useState(null);
    const [expandedParties, setExpandedParties] = useState({});

    const isUserInParty = (partyId) => {
        if (!partyId || !guildParties) return false;
        const partyData = guildParties.find(p => p.id === partyId);
        if (!partyData?.members) return false;
        return partyData.members.some(m => m.user_id === user?.id);
    };

    const visiblePartyQuests = partyQuests?.filter(q => isMaster || isUserInParty(q.party_id)) || [];
    const allGuildQuests = [...guildQuests, ...visiblePartyQuests];

    const allPendingReviews = [...pendingReviewQuests, ...partyPendingReviewQuests];

    const handleApproveGuild = async (userId) => {
        try {
            const res = await fetch('/api/guild/approve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, guildId: guild.guild_id })
            });
            
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to approve user');
            }

            if (onRefresh) onRefresh();
        } catch (err) {
            showToast(err.message, 'error');
        }
    };

    const handleRejectGuild = async (userId) => {
        try {
            const res = await fetch('/api/guild/reject', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, guildId: guild.guild_id })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to reject request');
            }
            
            if (onRefresh) onRefresh();
        } catch (err) {
            showToast(err.message, 'error');
        }
    };

    const handleRefreshCode = async () => {
        try {
            const res = await fetch('/api/guild/refresh-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ guildId: guild.guild_id })
            });
            if (!res.ok) throw new Error('Failed to refresh code');
            const data = await res.json();
            setJoinCode(data.joinCode);
        } catch (err) {
            showToast(err.message, 'error');
        }
    };

    const handleRemoveFromParty = async (partyId, memberId) => {
        try {
            const res = await fetch('/api/party/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    partyId,
                    action: 'update',
                    removeMemberIds: [memberId]
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to remove member');
            }

            showToast('Member removed from party', 'success');
            if (onRefresh) onRefresh();
        } catch (err) {
            showToast(err.message, 'error');
        }
    };

    const handlePartySuccess = () => {
        if (onRefresh) onRefresh();
        setShowCreateModal(false);
        setEditingParty(null);
    };

    const togglePartyExpand = (partyId) => {
        setExpandedParties(prev => ({
            ...prev,
            [partyId]: !prev[partyId]
        }));
    };

    const handleCopyCode = () => {
        navigator.clipboard.writeText(joinCode);
        showToast('Join code copied!', 'success');
    };

    const handleAcceptPickup = async (requestId) => {
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

    const handleDeclinePickup = async (requestId) => {
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

    const handleCancelPickup = async (questId) => {
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

    return (
        <div className='flex flex-col border p-4 rounded shadow-md bg-[var(--status-available-bg)]'>
            <div className='text-center mb-4'>
                <p className='arcade text-sm text-[var(--dark-brown)] mb-[2px]'>Guild</p>
                <h2 className='arcade outline-text-brown text-[var(--yellow)] text-xl font-bold'>{guild?.name || 'Guild'}</h2>
            </div>

            <div className='flex flex-col md:flex-row gap-4'>
                <MembersList
                    members={guildMembers}
                    guildRequests={guildRequests}
                    isMaster={isMaster}
                    user={user}
                    onRemoveMember={onRemoveMember}
                    onApproveGuild={handleApproveGuild}
                    onRejectGuild={handleRejectGuild}
                />

                <div className='flex-1 flex flex-col gap-4'>
                    {isMaster && (
                        <GuildCodeCard
                            joinCode={joinCode}
                            onCopy={handleCopyCode}
                            onRefresh={handleRefreshCode}
                        />
                    )}

                <GuildQuestsList
                    initialQuests={allGuildQuests}
                    pendingReviewQuests={allPendingReviews}
                    guildId={guild.guild_id}
                    isMaster={isMaster}
                    members={guildMembers}
                    parties={guildParties}
                    onRefresh={onRefresh}
                    onApproveComplete={onApproveComplete}
                    onRevise={onRevise}
                />

                {isMaster && pickupRequests.length > 0 && (
                    <Card variant='orange'>
                        <h2 className='font-semibold text-lg text-orange-600 mb-4'>Pickup Requests</h2>
                        <div className='space-y-3'>
                            {pickupRequests.map(request => (
                                <div key={request.id} className='border p-3 rounded bg-white'>
                                    <div className='flex justify-between items-start'>
                                        <div>
                                            <div className='flex items-center gap-2'>
                                                <h4 className='font-medium'>{request.quest_title}</h4>
                                            </div>
                                            {request.context_type === 'party' && request.party_name && (
                                                    <span className='text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded'>
                                                        Party: {request.party_name}
                                                    </span>
                                                )}
                                            <div className='flex items-center gap-2 mt-1'>
                                                
                                                <span className='text-sm text-gray-600'>
                                                    {request.first_name} {request.last_name}
                                                </span>
                                                <span className='text-xs text-gray-400'>
                                                    Level {request.user_level}
                                                </span>
                                            </div>
                                        </div>
                                        <div className='flex flex-col gap-2'>
                                            <BubbleButton 
                                                onClick={() => handleAcceptPickup(request.id)}
                                                className='bg-green-500 hover:bg-green-600 text-white text-xs'
                                            >
                                                Accept
                                            </BubbleButton>
                                            <BubbleButton 
                                                onClick={() => handleDeclinePickup(request.id)}
                                                variant='red'
                                                className='text-xs'
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

                {!isMaster && userPendingRequests.length > 0 && (
                    <Card variant='orange'>
                        <h2 className='font-semibold text-orange-600 text-lg mb-4'>My Requests</h2>
                        <div className='space-y-2'>
                            {userPendingRequests.map(request => {
                                const quest = [...guildQuests, ...partyQuests].find(q => q.id === request.quest_id);
                                return (
                                    <div key={request.id} className='border p-2 rounded bg-gray-50 flex justify-between items-center'>
                                        <span className='text-sm'>{quest?.title || 'Unknown Quest'}</span>
                                        <button 
                                            onClick={() => handleCancelPickup(request.quest_id)}
                                            className='text-xs cursor-pointer text-red-500 hover:text-red-700 underline'
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                )}

                <GuildPartiesList
                    parties={guildParties}
                    isMaster={isMaster}
                    user={user}
                    expandedParties={expandedParties}
                    onToggleExpand={togglePartyExpand}
                    onEditParty={setEditingParty}
                    onRemoveFromParty={handleRemoveFromParty}
                    onCreateParty={() => setShowCreateModal(true)}
                />
            </div>
            </div>

            <PartyCreationModal
                isOpen={showCreateModal || !!editingParty}
                onClose={() => {
                    setShowCreateModal(false);
                    setEditingParty(null);
                }}
                onSuccess={handlePartySuccess}
                members={guildMembers}
                existingParty={showCreateModal ? { guild_id: guild?.guild_id } : (editingParty ? { ...editingParty, guild_id: guild?.guild_id } : null)}
            />
        </div>
    );
}
