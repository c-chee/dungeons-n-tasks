'use client';
import { useState } from 'react';
import StatsCard from './cards/StatsCard';
import JoinCard from './cards/JoinCard';
import RequestsCard from './cards/RequestCard';
import CurrentMissionsCard from './cards/CurrentMissionsCard';

export default function DashboardHome({ data }) {
    const { user, guild, party, guildRequests, partyRequests } = data;
    const [guildCode, setGuildCode] = useState('');
    const [partyCode, setPartyCode] = useState('');

    async function joinGuild() { /* ... */ }
    async function joinParty() { /* ... */ }
    async function approveGuild(userId) { /* ... */ }
    async function approveParty(userId) { /* ... */ }

    return (
        <div
        className='flex flex-col gap-6 min-h-screen max-w-3xl p-6
                    bg-[url("/images/home-bg.png")] bg-cover bg-center bg-no-repeat'
        >
        {/* Stats */}
        <StatsCard coins={user.coins} level={user.level} />

        {/* Current Missions */}
        <CurrentMissionsCard quests={data.quests?.assignedQuests || []} />

        {/* Join Boxes */}
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

        {/* Requests */}
        {guild?.role === 'guild_master' && (
            <RequestsCard
            title='Guild Join Requests'
            requests={guildRequests}
            onApprove={approveGuild}
            variant='blueDark'
            />
        )}
        {party?.role === 'leader' && (
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