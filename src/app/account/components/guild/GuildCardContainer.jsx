'use client';
import React, { useState } from 'react';
import GuildQuestsList from './GuildQuestList';
import PartyCreationModal from '../ui/PartyCreationModal';
import MembersList from './MembersList';
import GuildCodeCard from './GuildCodeCard';
import GuildPartiesList from './GuildPartiesList';
import { useToast } from '../ui/ToastProvider';

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

    return (
        <div className='flex flex-col md:flex-row gap-4 border p-4 rounded shadow-md bg-white'>
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
