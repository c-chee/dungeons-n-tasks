'use client';
import { useState } from 'react';
import StatsCard from './cards/StatsCard';
import CurrentMissionsCard from './cards/CurrentMissionsCard';
import GuildContainer from './guild/GuildCardContainer';
import PartyContainer from './cards/PartyCardContainer';
import JoinCard from './cards/JoinCard';
import PendingRequestCard from './cards/PendingRequestCard';

export default function DashboardHome({ data }) {
    const { user, guild, party, guildRequests, partyRequests, pendingGuildRequests, quests, joinCode } = data;
    const [guildCode, setGuildCode] = useState('');
    const [partyCode, setPartyCode] = useState('');

    // --- Join guild ---
    async function joinGuild() {
        if (!guildCode) return;
        await fetch('/api/guild/join', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ joinCode: guildCode }),
        });
        window.location.reload();
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

    // --- Approve guild requests ---
    async function approveGuild(userId) {
        const res = await fetch('/api/guild/approve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, guildId: guild.guild_id }),
        });
        if (res.ok) window.location.reload();
    }

    // --- Reject guild request ---
    async function rejectGuild(userId) {
        console.log('Reject guild request', userId);
    }

    // --- Leave guild ---
    async function leaveGuild() {
        if (!guild) return;
        const res = await fetch('/api/guild/leave', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ guildId: guild.guild_id }),
        });
        if (res.ok) window.location.reload();
    }

    // --- Cancel pending guild request ---
    async function cancelGuildRequest(guildId) {
        const res = await fetch('/api/guild/cancel', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ guildId }),
        });
        if (res.ok) window.location.reload();
    }

    // --- Remove member (guild master only) ---
    async function removeMember(memberId) {
        if (!guild) return;
        const res = await fetch('/api/guild/remove', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ guildId: guild.guild_id, memberId }),
        });
        if (res.ok) window.location.reload();
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
                coins={user.coins} 
                level={user.level} 
                guild={guild}
                onLeave={leaveGuild}
            />

            {/* Current Missions */}
            <CurrentMissionsCard quests={quests?.assignedQuests || []} />

            {/* Guild Panel */}
            {guild ? (
                <GuildContainer
                    user={user}
                    guild={guild}
                    guildQuests={quests?.guildQuests || []}
                    guildRequests={guildRequests || []}
                    joinCode={joinCode}
                    onApprove={approveGuild}
                    onReject={rejectGuild}
                    onRemoveMember={removeMember}
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