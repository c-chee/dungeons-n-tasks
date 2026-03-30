'use client';
import { useState } from 'react';
import StatsCard from './cards/StatsCard';
import CurrentMissionsCard from './cards/CurrentMissionsCard';
import GuildContainer from './guild/GuildCardContainer';
import JoinCard from './cards/JoinCard';
import PendingRequestCard from './cards/PendingRequestCard';

export default function DashboardHome({ data }) {
    const [dashboardData, setDashboardData] = useState(data);
    const [guildCode, setGuildCode] = useState('');

    const { user, guild, guildRequests, pendingGuildRequests, guildMembers, guildParties, quests, joinCode } = dashboardData;

    const refreshDashboard = async () => {
        try {
            const res = await fetch('/api/dashboard');
            if (res.ok) {
                const fresh = await res.json();
                setDashboardData(fresh);
            }
        } catch (err) {
            console.log('Failed to refresh:', err);
        }
    };

    async function joinGuild() {
        if (!guildCode) return;
        const res = await fetch('/api/guild/join', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ joinCode: guildCode }),
        });
        if (res.ok) refreshDashboard();
    }

    async function leaveGuild() {
        if (!guild) return;
        const res = await fetch('/api/guild/leave', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ guildId: guild.guild_id }),
        });
        if (res.ok) refreshDashboard();
    }

    async function cancelGuildRequest(guildId) {
        const res = await fetch('/api/guild/cancel', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ guildId }),
        });
        if (res.ok) refreshDashboard();
    }

    async function removeMember(memberId) {
        if (!guild) return;
        const res = await fetch('/api/guild/remove', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ guildId: guild.guild_id, memberId }),
        });
        if (res.ok) refreshDashboard();
    }

    async function updateQuestStatus(questId, status, note = '') {
        try {
            const res = await fetch('/api/quest/update-status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ questId, status, block_reason: note }),
            });
            if (res.ok) refreshDashboard();
        } catch (err) {
            console.log('Failed to update quest status:', err);
        }
    }

    async function submitQuestComplete(questId) {
        await updateQuestStatus(questId, 'pending_review');
    }

    async function approveQuestComplete(questId) {
        try {
            const res = await fetch('/api/quest/approve-complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ questId }),
            });
            if (res.ok) refreshDashboard();
        } catch (err) {
            console.log('Failed to approve quest:', err);
        }
    }

    async function reviseQuest(questId, note = '') {
        try {
            const res = await fetch('/api/quest/revise', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ questId, revision_note: note }),
            });
            if (res.ok) refreshDashboard();
        } catch (err) {
            console.log('Failed to revise quest:', err);
        }
    }

    return (
        <div className='min-h-screen max-w-7xl mx-auto
                        bg-[url("/images/home-bg.png")] bg-cover bg-center bg-no-repeat'>

            <div className='flex flex-col lg:flex-row gap-6'>
                {/* Left Column */}
                <div className='flex flex-col gap-6 w-full lg:w-1/3'>
                    <StatsCard 
                        coins={user?.coins} 
                        level={user?.level}
                        level_xp={user?.level_xp}
                        guild={guild}
                        onLeave={leaveGuild}
                    />

                    <CurrentMissionsCard 
                        quests={quests?.assignedQuests || []}
                        onUpdateStatus={updateQuestStatus}
                        onSubmitComplete={submitQuestComplete}
                    />
                </div>

                {/* Right Column */}
                <div className='w-full lg:w-2/3'>
                    {guild ? (
                        <GuildContainer
                            user={user}
                            guild={guild}
                            guildQuests={quests?.guildQuests || []}
                            partyQuests={quests?.partyQuests || []}
                            pendingReviewQuests={quests?.pendingReviewQuests || []}
                            partyPendingReviewQuests={quests?.partyPendingReviewQuests || []}
                            guildRequests={guildRequests || []}
                            guildMembers={guildMembers || []}
                            guildParties={guildParties || []}
                            joinCode={joinCode}
                            pickupRequests={quests?.pickupRequests || []}
                            userPendingRequests={quests?.userPendingRequests || []}
                            onRemoveMember={removeMember}
                            onRefresh={refreshDashboard}
                            onApproveComplete={approveQuestComplete}
                            onRevise={reviseQuest}
                        />
                    ) : pendingGuildRequests?.length > 0 ? (
                        <PendingRequestCard 
                            requests={pendingGuildRequests} 
                            onCancel={cancelGuildRequest}
                        />
                    ) : (
                        <JoinCard
                            type='guild'
                            code={guildCode}
                            setCode={setGuildCode}
                            onJoin={joinGuild}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
