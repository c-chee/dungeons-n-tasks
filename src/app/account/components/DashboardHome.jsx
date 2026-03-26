'use client';
import { useState } from 'react';
import StatsCard from './cards/StatsCard';
import CurrentMissionsCard from './cards/CurrentMissionsCard';
import GuildContainer from './guild/GuildCardContainer';
import PartyContainer from './cards/PartyCardContainer';
import JoinCard from './cards/JoinCard';
import BubbleButton from '@/components/ui/BubbleButton';

export default function DashboardHome({ data }) {
    const { user, guild, party, guildRequests, partyRequests, quests } = data;
    const [guildCode, setGuildCode] = useState('');
    const [partyCode, setPartyCode] = useState('');
    const [avatar, setAvatar] = useState(user.avatar || '');

    // --- Join Guild ---
    async function joinGuild() {
        if (!guildCode) return;
        await fetch('/api/guild/join', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: guildCode }),
        });
        window.location.reload();
    }

    // --- Join Party ---
    async function joinParty() {
        if (!partyCode) return;
        await fetch('/api/party/join', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: partyCode }),
        });
        window.location.reload();
    }

    // --- Approve Requests ---
    async function approveGuild(userId) {
        console.log('Approve guild request', userId);
    }
    async function approveParty(userId) {
        console.log('Approve party request', userId);
    }

    return (
        <div className="flex flex-col gap-6 min-h-screen max-w-4xl p-6
                        bg-[url('/images/home-bg.png')] bg-cover bg-center bg-no-repeat">

            {/* Stats & Avatar */}
            <StatsCard coins={user.coins} level={user.level}>
                <div className="mt-4">
                    <h3 className="font-semibold mb-2">Select Avatar</h3>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) setAvatar(URL.createObjectURL(file));
                        }}
                    />
                    {avatar && <img src={avatar} alt="Avatar" className="mt-2 w-20 h-20 rounded-full border" />}
                </div>
            </StatsCard>

            {/* Current Missions */}
            <CurrentMissionsCard quests={quests?.assignedQuests || []} />

            {/* Guild Container */}
            <GuildContainer
                user={user}
                guild={guild}
                guildQuests={quests?.guildQuests || []}
                guildRequests={guildRequests || []}
                joinCode={guild?.join_code || ''}
                onApprove={approveGuild}
            />

            {/* Party Container */}
            <PartyContainer
                user={user}
                party={party}
                partyQuests={quests?.partyQuests || []}
                partyRequests={partyRequests || []}
                onApprove={approveParty}
            />

            {/* Join Cards */}
            {!guild && (
                <JoinCard type="guild" code={guildCode} setCode={setGuildCode} onJoin={joinGuild} />
            )}
            {!party && (
                <JoinCard type="party" code={partyCode} setCode={setPartyCode} onJoin={joinParty} />
            )}
        </div>
    );
}