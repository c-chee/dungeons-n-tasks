'use client';
import { useState, useEffect } from 'react';
import StatsCard from './cards/StatsCard';
import CurrentMissionsCard from './cards/CurrentMissionsCard';
import GuildContainer from './guild/GuildCardContainer';
import PartyContainer from './cards/PartyCardContainer';
import JoinCard from './cards/JoinCard';
import PendingRequestCard from './cards/PendingRequestCard';

export default function DashboardHome({ data }) {
    const [dashboardData, setDashboardData] = useState(data);
    const [refreshKey, setRefreshKey] = useState(0);
    const [guildCode, setGuildCode] = useState('');
    const [partyCode, setPartyCode] = useState('');

    const { user, guild, party, guildRequests, partyRequests, pendingGuildRequests, guildMembers, guildParties, quests, joinCode } = dashboardData;

    useEffect(() => {
        async function refreshData() {
            try {
                const res = await fetch('/api/dashboard');
                if (res.ok) {
                    const fresh = await res.json();
                    setDashboardData(fresh);
                }
            } catch (err) {
                console.log('Failed to refresh data:', err);
            }
        }
        refreshData();
    }, [refreshKey]);

    const handleRefresh = () => {
        setRefreshKey(k => k + 1);
    };

    // --- Join guild ---
    async function joinGuild() {
        if (!guildCode) return;
        const res = await fetch('/api/guild/join', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ joinCode: guildCode }),
        });
        if (res.ok) handleRefresh();
    }

    // --- Join party ---
    async function joinParty() {
        if (!partyCode) return;
        await fetch('/api/party/join', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: partyCode }),
        });
        window.location.reload();
    }

    // --- Leave guild ---
    async function leaveGuild() {
        if (!guild) return;
        const res = await fetch('/api/guild/leave', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ guildId: guild.guild_id }),
        });
        if (res.ok) handleRefresh();
    }

    // --- Cancel pending guild request ---
    async function cancelGuildRequest(guildId) {
        const res = await fetch('/api/guild/cancel', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ guildId }),
        });
        if (res.ok) handleRefresh();
    }

    // --- Remove member (guild master only) ---
    async function removeMember(memberId) {
        if (!guild) return;
        const res = await fetch('/api/guild/remove', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ guildId: guild.guild_id, memberId }),
        });
        if (res.ok) handleRefresh();
    }

    // --- Approve party requests ---
    async function approveParty(userId) {
        const res = await fetch('/api/party/approve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, partyId: party.party_id }),
        });
        if (res.ok) window.location.reload();
    }

    return (
        <div className='flex flex-col gap-6 min-h-screen max-w-5xl p-6
                        bg-[url("/images/home-bg.png")] bg-cover bg-center bg-no-repeat'>

            {/* Stats */}
            <StatsCard 
                coins={user?.coins} 
                level={user?.level} 
                guild={guild}
                onLeave={leaveGuild}
            />

            {/* Current Missions */}
            <CurrentMissionsCard quests={quests?.assignedQuests || []} />

            {/* Guild Panel */}
            {guild ? (
                <GuildContainer
                    key={refreshKey}
                    user={user}
                    guild={guild}
                    guildQuests={quests?.guildQuests || []}
                    guildRequests={guildRequests || []}
                    guildMembers={guildMembers || []}
                    guildParties={guildParties || []}
                    joinCode={joinCode}
                    onRemoveMember={removeMember}
                    onRefresh={handleRefresh}
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

            {/* Party Panel */}
            {party ? (
                <PartyContainer
                    user={user}
                    party={party}
                    partyQuests={quests?.partyQuests || []}
                    partyRequests={partyRequests || []}
                />
            ) : (
                <JoinCard
                    type='party'
                    code={partyCode}
                    setCode={setPartyCode}
                    onJoin={joinParty}
                />
            )}
        </div>
    );
}
