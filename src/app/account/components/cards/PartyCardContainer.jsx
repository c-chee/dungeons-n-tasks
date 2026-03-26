'use client';

import React, { useState } from 'react';
import QuestItem from '../QuestItem';
import JoinCard from './JoinCard';
import BubbleButton from '@/components/ui/BubbleButton';

export default function PartyContainer({ party, partyQuests }) {
    const [partyCode, setPartyCode] = useState('');

    async function handleJoinParty() {
        if (!partyCode) return;
        await fetch('/api/party/join', {
        method: 'POST',
        body: JSON.stringify({ code: partyCode }),
        });
        window.location.reload();
    }

    return (
        <div className='border rounded p-4 shadow-md space-y-4'>
        <h2 className='text-lg font-bold'>Party</h2>

        {!party ? (
            <>
            <p className='text-sm text-gray-500'>Not currently in a party</p>
            <JoinCard
                type='party'
                code={partyCode}
                setCode={setPartyCode}
                onJoin={handleJoinParty}
            />
            </>
        ) : (
            <>
            {/* Current Party Info */}
            <div>
                <h3 className='font-semibold'>Current Party</h3>
                <div className='border p-2 rounded'>
                <p>{party.name}</p>
                <p>XP Progress: {party.xp}/{party.xp_goal}</p>
                </div>
            </div>

            {/* Party Quests */}
            <div>
                <h3 className='font-semibold'>Party Quests</h3>
                {partyQuests?.length ? (
                partyQuests.map(q => <QuestItem key={q.id} quest={q} />)
                ) : (
                <p className='text-sm text-gray-500'>No current quests</p>
                )}
            </div>

            {/* Attach Quest */}
            <BubbleButton>Attach a Quest</BubbleButton>
            </>
        )}
        </div>
    );
}