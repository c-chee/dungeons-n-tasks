'use client';

import React, { useState } from 'react';
import QuestItem from '../QuestItem';
import JoinCard from './JoinCard';
import BubbleButton from '@/components/ui/BubbleButton';
import Card from './Card';

export default function GuildContainer({ guild, guildQuests, joinCode }) {
    const [guildCode, setGuildCode] = useState('');

    async function handleJoinGuild() {
        if (!guildCode) return;
        await fetch('/api/guild/join', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: guildCode }),
        });
        window.location.reload();
    }

    function copyJoinCode() {
        navigator.clipboard.writeText(joinCode);
        alert('Guild join code copied!');
    }

    return (
        <div className='border rounded p-4 shadow-md space-y-4 bg-white'>
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
                    {/* Guild Join Code for Guild Master */}
                    {guild.role === 'guild_master' && (
                        <Card variant='blueDark'>
                            <h3 className='font-semibold'>Guild Join Code</h3>
                            <div className='flex items-center gap-2 mt-2'>
                                <input
                                    type='text'
                                    value={joinCode || ''}
                                    readOnly
                                    className='border p-1 rounded flex-1 bg-gray-100'
                                />
                                <BubbleButton onClick={copyJoinCode}>Copy</BubbleButton>
                            </div>
                        </Card>
                    )}

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