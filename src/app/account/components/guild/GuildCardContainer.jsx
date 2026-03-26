'use client';
import React, { useState } from 'react';
import BubbleButton from '@/components/ui/BubbleButton';
import GuildQuestsList from './GuildQuestList';
import PartyContainer from '../cards/PartyCardContainer';
import { useToast } from '../ui/ToastProvider';

export default function GuildContainer({ guild, guildQuests, guildRequests, guildMembers, guildParties, user, onRemoveMember }) {
    const { showToast } = useToast();
    const isMaster = guild?.role === 'guild_master';
    const [members, setMembers] = useState(guildMembers || []);
    const [pendingRequests, setPendingRequests] = useState(guildRequests || []);
    const [quests, setQuests] = useState(guildQuests || []);
    const [parties, setParties] = useState(guildParties || []);
    const [joinCode, setJoinCode] = useState(guild?.join_code || '');
    
    const [newPartyName, setNewPartyName] = useState('');
    const [showPartyForm, setShowPartyForm] = useState(false);

    /** Create a new party */
    const handleAddParty = async () => {
        if (!newPartyName) return;
        try {
            const res = await fetch('/api/parties/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newPartyName, guild_id: guild.id })
            });
            if (!res.ok) throw new Error('Failed to create party');
            const data = await res.json();
            setParties([...parties, { id: Date.now(), name: newPartyName, xp_current: 0, xp_goal: 100 }]);
            setNewPartyName('');
            setShowPartyForm(false);
        } catch (err) {
            console.error(err);
        }
    };

    /** Approve guild join request */
    const handleApproveGuild = async (userId) => {
        try {
            const res = await fetch('/api/guild/approve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, guildId: guild.id })
            });
            if (!res.ok) throw new Error('Failed to approve user');

            const request = pendingRequests.find(r => r.user_id === userId);
            setPendingRequests(pendingRequests.filter(r => r.user_id !== userId));

            if (request) {
                const [firstName, ...lastNameParts] = request.username.split(' ');
                setMembers([...members, {
                    id: userId,
                    first_name: firstName,
                    last_name: lastNameParts.join(' '),
                    level: 1
                }]);
            }
        } catch (err) {
            console.error(err);
        }
    };

    /** Reject guild join request */
    const handleRejectGuild = async (userId) => {
        try {
            const res = await fetch('/api/guild/reject', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, guildId: guild.id })
            });
            if (!res.ok) throw new Error('Failed to reject request');
            setPendingRequests(pendingRequests.filter(r => r.user_id !== userId));
        } catch (err) {
            console.error(err);
        }
    };

    /** Refresh guild join code */
    const handleRefreshCode = async () => {
        try {
            const res = await fetch('/api/guild/refresh-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ guildId: guild.id })
            });
            if (!res.ok) throw new Error('Failed to refresh code');
            const data = await res.json();
            setJoinCode(data.joinCode);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className='flex flex-col md:flex-row gap-4 border p-4 rounded shadow-md bg-white'>
            
            {/* Members List */}
            <div className='flex-1 border p-2 rounded max-h-[500px] overflow-y-auto'>
                <h3 className='font-semibold mb-2'>Members</h3>
                {members.length ? (
                    members.map(m => (
                        <div key={m.id} className='flex items-center gap-2 mb-2'>
                            <div className='w-8 h-8 rounded-full bg-[var(--light-green)] flex items-center justify-center text-sm font-bold'>
                                {m.first_name?.[0]}{m.last_name?.[0]}
                            </div>
                            <div className='flex-1 min-w-0'>
                                <div className='flex items-center gap-2'>
                                    <p className='truncate max-w-[120px]'>{m.first_name} {m.last_name}</p>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${
                                        m.role === 'guild_master' 
                                            ? 'bg-yellow-500 text-white' 
                                            : 'bg-gray-200 text-gray-700'
                                    }`}>
                                        {m.role === 'guild_master' ? 'Master' : 'Member'}
                                    </span>
                                </div>
                                <p className='text-sm text-gray-500'>Level {m.level}</p>
                            </div>
                            {isMaster && m.id !== user?.id && onRemoveMember && (
                                <button 
                                    onClick={() => onRemoveMember(m.id)}
                                    className='text-red-500 hover:text-red-700 font-bold text-lg w-6 h-6 flex items-center justify-center'
                                    title='Remove member'
                                >
                                    ×
                                </button>
                            )}
                        </div>
                    ))
                ) : (
                    <p className='text-sm text-gray-500'>No members yet</p>
                )}

                {isMaster && pendingRequests.length > 0 && (
                    <div className='mt-4'>
                        <h4 className='font-semibold mb-2'>Pending Requests</h4>
                        {pendingRequests.map(r => (
                            <div key={r.user_id} className='flex justify-between items-center border p-1 rounded mb-1'>
                                <span>{r.username}</span>
                                <div className='flex gap-1'>
                                    <BubbleButton onClick={() => handleRejectGuild(r.user_id)} className='bg-gray-400 hover:bg-gray-500'>Decline</BubbleButton>
                                    <BubbleButton onClick={() => handleApproveGuild(r.user_id)}>Approve</BubbleButton>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Quests & Parties */}
            <div className='flex-1 flex flex-col gap-4'>
                
                {/* Code */}
                {isMaster && (
                    <div className='flex items-center justify-between mb-2 p-2 border rounded bg-gray-50'>
                        <span className='font-mono text-lg font-bold'>{joinCode}</span>
                        <div className='flex gap-2'>
                            <BubbleButton onClick={() => {
                                navigator.clipboard.writeText(joinCode);
                                showToast('Join code copied!', 'success');
                            }}>
                                Copy
                            </BubbleButton>
                            <BubbleButton onClick={handleRefreshCode} className='bg-blue-500 hover:bg-blue-600'>
                                Refresh
                            </BubbleButton>
                        </div>
                    </div>
                )}

                {/* Guild Quests */}
                <GuildQuestsList
                    initialQuests={guildQuests}
                    guildId={guild.id}
                    isMaster={isMaster}
                    members={members}
                    parties={parties}
                />

                {/* Guild Parties */}
                <div className='border p-2 rounded'>
                    <h3 className='font-semibold flex justify-between items-center'>
                        Guild Parties
                        {isMaster && <BubbleButton onClick={() => setShowPartyForm(!showPartyForm)}>+ Add</BubbleButton>}
                    </h3>

                    {showPartyForm && (
                        <div className='flex gap-1 items-center mt-1'>
                            <input
                                placeholder='Party Name'
                                className='border p-1 rounded flex-1'
                                value={newPartyName}
                                onChange={e => setNewPartyName(e.target.value)}
                            />
                            <BubbleButton onClick={handleAddParty}>Create</BubbleButton>
                        </div>
                    )}

                    <div className='mt-2 flex flex-col gap-2'>
                        {parties.length ? (
                            parties.map(p => (
                                <div key={p.id} className='border p-2 rounded'>
                                    <p className='font-medium'>{p.name}</p>
                                    <p className='text-sm text-gray-500'>XP: {p.xp_current}/{p.xp_goal}</p>
                                </div>
                            ))
                        ) : (
                            <p className='text-sm text-gray-500'>No parties yet</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}