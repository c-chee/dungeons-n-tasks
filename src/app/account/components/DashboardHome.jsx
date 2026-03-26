'use client';
import { useState } from 'react';
import StatsCard from './cards/StatsCard';
import CurrentMissionsCard from './cards/CurrentMissionsCard';
import GuildContainer from './cards/GuildCardContainer';
import PartyContainer from './cards/PartyCardContainer';
import JoinCard from './cards/JoinCard';
import RequestsCard from './cards/RequestCard';

export default function DashboardHome({ data }) {
    const { user, guild, party, guildRequests, partyRequests, quests } = data;
    const [guildCode, setGuildCode] = useState('');
    const [partyCode, setPartyCode] = useState('');

    async function joinGuild() {
        if (!guildCode) return;
        await fetch('/api/guild/join', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: guildCode }),
        });
        window.location.reload();
    }

    async function joinParty() {
        if (!partyCode) return;
        await fetch('/api/party/join', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: partyCode }),
        });
        window.location.reload();
    }

    async function approveGuild(userId) {
        console.log('Approve guild request', userId);
    }

    async function approveParty(userId) {
        console.log('Approve party request', userId);
    }

    return (
        <div
            className='flex flex-col gap-6 min-h-screen max-w-3xl p-6
                       bg-[url("/images/home-bg.png")] bg-cover bg-center bg-no-repeat'
        >
            {/* Stats */}
            <StatsCard coins={user.coins} level={user.level} />

            {/* Current Missions */}
            <CurrentMissionsCard quests={quests?.assignedQuests || []} />

            {/* Guild Panel */}
            <GuildContainer
                guild={guild}
                guildQuests={quests?.guildQuests || []}
                guildRequests={guildRequests || []}
                user={user}
                joinCode={guild?.join_code || ''} // <-- pass the join code
            />

            {/* Party Panel */}
            <PartyContainer
                party={party}
                partyQuests={quests?.partyQuests || []}
            />

            {/* Join Boxes for users not in guild/party (optional) */}
            {!guild && (
                <JoinCard
                    type='guild'
                    code={guildCode}
                    setCode={setGuildCode}
                    onJoin={joinGuild}
                />
            )}
            {!party && (
                <JoinCard
                    type='party'
                    code={partyCode}
                    setCode={setPartyCode}
                    onJoin={joinParty}
                />
            )}

            {/* Requests (redundant if inside guild/party container) */}
            {guild?.role === 'guild_master' && guildRequests?.length > 0 && (
                <RequestsCard
                    title='Guild Join Requests'
                    requests={guildRequests}
                    onApprove={approveGuild}
                    variant='blueDark'
                />
            )}

            {party?.role === 'leader' && partyRequests?.length > 0 && (
                <RequestsCard
                    title='Party Join Requests'
                    requests={partyRequests}
                    onApprove={approveParty}
                    variant='greenDark'
                />
            )}
        </div>
    );
}