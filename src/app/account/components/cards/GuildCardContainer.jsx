'use client';

import React, { useState } from 'react';
import QuestItem from '../QuestItem';
import JoinCard from './JoinCard';

export default function GuildContainer({ guild, guildQuests }) {
    const [guildCode, setGuildCode] = useState('');

    async function handleJoinGuild() {
        if (!guildCode) return;
        await fetch('/api/guild/join', {
        method: 'POST',
        body: JSON.stringify({ code: guildCode }),
        });
        window.location.reload();
    }

    return (
        <div className='border rounded p-4 shadow-md space-y-4'>
        <h2 className='text-lg font-bold'>Guild</h2>

        {!guild ? (
            <>
            <p className='text-sm text-gray-500'>Not currently in a guild</p>
            <JoinCard
                type='guild'
                code={guildCode}
                setCode={setGuildCode}
                onJoin={handleJoinGuild}
            />
            </>
        ) : (
            <>
            {/* Guild Quests */}
            <div>
                <h3 className='font-semibold'>Guild Quests</h3>
                {guildQuests?.length ? (
                guildQuests.map(q => <QuestItem key={q.id} quest={q} />)
                ) : (
                <p className='text-sm text-gray-500'>No current quests</p>
                )}
            </div>

            {/* Guild Parties */}
            <div>
                <h3 className='font-semibold'>Guild Parties</h3>
                {guild.parties?.length ? (
                guild.parties.map(p => (
                    <div key={p.id} className='border p-2 mb-2 rounded'>
                    <p>{p.name}</p>
                    <p>XP Progress: {p.xp}/{p.xp_goal}</p>
                    </div>
                ))
                ) : (
                <p className='text-sm text-gray-500'>No current parties</p>
                )}
            </div>
            </>
        )}
        </div>
    );
}