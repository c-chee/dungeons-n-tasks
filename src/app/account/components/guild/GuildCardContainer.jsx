'use client';
import React, { useState } from 'react';
import BubbleButton from '@/components/ui/BubbleButton';
import GuildQuestsList from './GuildQuestList';
import PartyContainer from '../cards/PartyCardContainer';
import PartyCreationModal from '../ui/PartyCreationModal';
import { useToast } from '../ui/ToastProvider';

const StarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
);

const ChevronIcon = ({ expanded }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="16" 
        height="16" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
    >
        <polyline points="6 9 12 15 18 9"/>
    </svg>
);

const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
);

export default function GuildContainer({ guild, guildQuests, guildRequests, guildMembers, guildParties, user, onRemoveMember, onRefresh, pendingReviewQuests = [], partyQuests = [], partyPendingReviewQuests = [], onApproveComplete, onRevise }) {
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

    const togglePartyExpand = (partyId) => {
        setExpandedParties(prev => ({
            ...prev,
            [partyId]: !prev[partyId]
        }));
    };

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

    return (
        <div className='flex flex-col md:flex-row gap-4 border p-4 rounded shadow-md bg-white'>
            
            {/* Members List */}
            <div className='flex-1 border p-2 rounded max-h-[500px] overflow-y-auto'>
                <h3 className='font-semibold mb-2'>Members</h3>
                {guildMembers.length ? (
                    guildMembers.map(m => (
                        <div key={m.id} className='flex items-center gap-2 mb-2'>
                            <div className='w-8 h-8 rounded-full bg-[var(--light-green)] flex items-center justify-center text-sm font-bold'>
                                {m.first_name?.[0]}{m.last_name?.[0]}
                            </div>
                            <div className='flex-1 min-w-0'>
                                <div className='flex items-center gap-2'>
                                    <p className='truncate max-w-[120px]'>{m.first_name} {m.last_name}</p>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${
                                        m.role === 'guild_master' 
                                            ? 'bg-yellow-500 text-white' 
                                            : 'bg-gray-200 text-gray-700'
                                    }`}>
                                        {m.role === 'guild_master' ? 'Master' : 'Member'}
                                    </span>
                                </div>
                                <p className='text-sm text-gray-500'>Level {m.level}</p>
                            </div>
                            {isMaster && m.id !== user?.id && onRemoveMember && (
                                <button 
                                    onClick={() => onRemoveMember(m.id)}
                                    className='text-red-500 hover:text-red-700 font-bold text-lg w-6 h-6 flex items-center justify-center'
                                    title='Remove member'
                                >
                                    ×
                                </button>
                            )}
                        </div>
                    ))
                ) : (
                    <p className='text-sm text-gray-500'>No members yet</p>
                )}

                {isMaster && guildRequests.length > 0 && (
                    <div className='mt-4'>
                        <h4 className='font-semibold mb-2'>Pending Requests</h4>
                        {guildRequests.map(r => (
                            <div key={r.user_id} className='flex justify-between items-center border p-1 rounded mb-1'>
                                <span>{r.username}</span>
                                <div className='flex gap-1'>
                                    <BubbleButton onClick={() => handleRejectGuild(r.user_id)} className='bg-gray-400 hover:bg-gray-500'>Decline</BubbleButton>
                                    <BubbleButton onClick={() => handleApproveGuild(r.user_id)}>Approve</BubbleButton>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Quests & Parties */}
            <div className='flex-1 flex flex-col gap-4'>
                
                {/* Code */}
                {isMaster && (
                    <div className='flex items-center justify-between mb-2 p-2 border rounded bg-gray-50'>
                        <span className='font-mono text-lg font-bold'>{joinCode}</span>
                        <BubbleButton onClick={() => {
                            navigator.clipboard.writeText(joinCode);
                            showToast('Join code copied!', 'success');
                        }}>
                            Copy
                        </BubbleButton>
                    </div>
                )}

                {/* Guild Quests */}
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

                {/* Guild Parties */}
                <div className='border p-2 rounded'>
                    <h3 className='font-semibold flex justify-between items-center'>
                        Guild Parties
                        {isMaster && <BubbleButton onClick={() => setShowCreateModal(true)}>+ Add</BubbleButton>}
                    </h3>

                    <div className='mt-2 flex flex-col gap-2'>
                        {guildParties.length ? (
                            guildParties.map(p => {
                                const isExpanded = expandedParties[p.id];
                                const isUserInParty = p.members?.some(m => m.user_id === user?.id);
                                return (
                                    <div 
                                        key={p.id} 
                                        className={`border p-2 rounded ${isUserInParty ? 'border-green-400 bg-green-50' : ''}`}
                                    >
                                        <div 
                                            className='flex justify-between items-center cursor-pointer'
                                            onClick={() => togglePartyExpand(p.id)}
                                        >
                                            <div className='flex-1'>
                                                <div className='flex items-center gap-2'>
                                                    {p.leader_id && (
                                                        <span className='text-yellow-500'>
                                                            <StarIcon />
                                                        </span>
                                                    )}
                                                    <p className='font-medium'>{p.name}</p>
                                                    {isUserInParty && (
                                                        <span className='text-xs bg-green-500 text-white px-2 py-0.5 rounded'>
                                                            Your Party
                                                        </span>
                                                    )}
                                                </div>
                                                <div className='flex items-center gap-2 text-xs text-gray-500 mt-1'>
                                                    <span>XP Total: {p.xp_current}</span>
                                                    <span className='text-gray-400'>•</span>
                                                    <span>{p.member_count || 0}/15 members</span>
                                                </div>
                                            </div>
                                            <div className='flex items-center gap-2'>
                                                {isMaster && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setEditingParty(p);
                                                        }}
                                                        className='text-blue-500 hover:text-blue-700 text-xs'
                                                    >
                                                        Edit
                                                    </button>
                                                )}
                                                <ChevronIcon expanded={isExpanded} />
                                            </div>
                                        </div>

                                        {isExpanded && p.members?.length > 0 && (
                                            <div className='mt-2 pt-2 border-t'>
                                                <p className='text-xs font-medium text-gray-500 mb-1'>Members:</p>
                                                {p.members.map(m => (
                                                    <div key={m.user_id} className='flex items-center justify-between py-1'>
                                                        <div className='flex items-center gap-2'>
                                                            {m.role === 'leader' && (
                                                                <span className='text-yellow-500'>
                                                                    <StarIcon />
                                                                </span>
                                                            )}
                                                            <span className='text-sm'>
                                                                {m.first_name} {m.last_name}
                                                            </span>
                                                            {m.role === 'leader' && (
                                                                <span className='text-xs text-gray-400'>(Leader)</span>
                                                            )}
                                                        </div>
                                                        {isMaster && m.user_id !== user?.id && (
                                                            <button
                                                                onClick={() => handleRemoveFromParty(p.id, m.user_id)}
                                                                className='text-red-400 hover:text-red-600'
                                                                title='Remove from party'
                                                            >
                                                                <XIcon />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <p className='text-sm text-gray-500'>No parties yet</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Party Creation/Edit Modal */}
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
