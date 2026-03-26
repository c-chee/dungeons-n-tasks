'use client';
import { useState } from 'react';
import StatsCard from './cards/StatsCard';
import JoinCard from './cards/JoinCard';
import RequestsCard from './cards/RequestCard';
import CurrentMissionsCard from './cards/CurrentMissionsCard';
import GuildMasterPanel from './cards/GuildMasterPanel';

export default function DashboardHome({ data }) {
    const { user, guild, party, guildRequests, partyRequests } = data;
    const [guildCode, setGuildCode] = useState('');
    const [partyCode, setPartyCode] = useState('');

    /**
     * Placeholder functions for joining guilds/parties
     * You should replace these with real API calls
     */
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

            {/* --- Join Boxes for non-members --- */}
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

            {/* --- Guild Master Panel --- */}
            {guild?.role === 'guild_master' && (
                <GuildMasterPanel
                    guildName={guild.guild_name}
                    requests={guildRequests}
                    onApprove={approveGuild}
                />
            )}

            {/* --- Party Leader Panel --- */}
            {party?.role === 'leader' && (
                <RequestsCard
                    title='Party Join Requests'
                    requests={partyRequests}
                    onApprove={approveParty}
                    variant='greenDark'
                />
            )}

            {/* --- Regular Member Notes --- */}
            {guild?.role === 'member' && (
                <div className='p-4 bg-white/50 rounded-md border'>
                    <h3 className='font-bold'>Guild Info</h3>
                    <p>You are a member of <strong>{guild.guild_name}</strong>.</p>
                    <p>Check with your guild master for tasks and updates.</p>
                </div>
            )}

        </div>
    );
}