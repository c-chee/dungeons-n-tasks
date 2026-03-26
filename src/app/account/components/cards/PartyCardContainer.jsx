'use client';
import React, { useState } from 'react';
import QuestItem from '../QuestItem';
import JoinCard from './JoinCard';
import BubbleButton from '@/components/ui/BubbleButton';

export default function PartyContainer({ user, party, partyQuests, partyRequests }) {
    const [partyCode, setPartyCode] = useState('');

    // --- Handle joining a party ---
    async function handleJoinParty() {
        if (!partyCode) return;

        try {
            await fetch('/api/party/join', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: partyCode }),
            });
            window.location.reload();
        } catch (err) {
            console.error('Join party failed:', err);
        }
    }

    // --- If no user, show nothing ---
    if (!user) return null;

    return (
        <div className='border rounded p-4 shadow-md space-y-4'>
            <h2 className='text-lg font-bold'>Party</h2>

            {/* If user has no party, show join box */}
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
                    {/* Party info */}
                    <div>
                        <h3 className='font-semibold'>Party Info</h3>
                        <p>Name: {party.name}</p>
                        <p>Your Role: {party.role}</p>
                        <p className='text-sm text-gray-500'>Join Code: {party.code}</p>
                    </div>

                    {/* Party Quests */}
                    <div>
                        <h3 className='font-semibold'>Party Quests</h3>
                        {partyQuests?.length ? (
                            partyQuests.map((q) => <QuestItem key={q.id} quest={q} />)
                        ) : (
                            <p className='text-sm text-gray-500'>No current quests</p>
                        )}
                    </div>

                    {/* Party Join Requests (only if leader) */}
                    {party.role === 'leader' && partyRequests?.length > 0 && (
                        <div>
                            <h3 className='font-semibold'>Pending Join Requests</h3>
                            {partyRequests.map((r) => (
                                <div key={r.user_id} className='flex justify-between items-center border p-2 rounded mb-2'>
                                    <span>{r.username}</span>
                                    <BubbleButton onClick={() => console.log('Approve', r.user_id)}>Approve</BubbleButton>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Optional actions */}
                    <BubbleButton onClick={() => console.log('Attach Quest')}>Attach a Quest</BubbleButton>
                </>
            )}
        </div>
    );
}