'use client';
import { useState } from 'react';
import StatsCard from './cards/StatsCard';
import CurrentMissionsCard from './cards/CurrentMissionsCard';
import GuildContainer from './guild/GuildCardContainer';
import PartyContainer from './cards/PartyCardContainer';
import JoinCard from './cards/JoinCard';

export default function DashboardHome({ data }) {
    const { user, guild, party, guildRequests, partyRequests, quests, joinCode } = data;
    const [guildCode, setGuildCode] = useState('');
    const [partyCode, setPartyCode] = useState('');

    // --- Join guild ---
    async function joinGuild() {
        if (!guildCode) return;
        await fetch('/api/guild/join', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: guildCode }),
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
        // Add reject API later
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
            <StatsCard coins={user.coins} level={user.level} />

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