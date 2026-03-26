'use client';
import React, { useState } from 'react';
import BubbleButton from '@/components/ui/BubbleButton';
import GuildQuestsList from './GuildQuestList';
import PartyContainer from '../cards/PartyCardContainer';

export default function GuildContainer({ guild, initialGuildQuests, guildRequests, user }) {
    const isMaster = guild?.role === 'guild_master';
    const [members, setMembers] = useState(guild?.members || []);
    const [quests, setQuests] = useState(initialGuildQuests || []);
    const [parties, setParties] = useState(guild?.parties || []);
    
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
            setMembers([...members, members.find(m => m.id === userId)]); // simple refresh
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="flex flex-col md:flex-row gap-4 border p-4 rounded shadow-md bg-white">
            
            {/* Members List */}
            <div className="flex-1 border p-2 rounded max-h-[500px] overflow-y-auto">
                <h3 className="font-semibold mb-2">Members</h3>
                {members.length ? (
                    members.map(m => (
                        <div key={m.id} className="flex items-center gap-2 mb-2">
                            <img src={m.avatar || '/images/default-avatar.png'} className="w-8 h-8 rounded-full" />
                            <div>
                                <p>{m.first_name} {m.last_name}</p>
                                <p className="text-sm text-gray-500">Level {m.level}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-gray-500">No members yet</p>
                )}

                {isMaster && guildRequests.length > 0 && (
                    <div className="mt-4">
                        <h4 className="font-semibold mb-2">Pending Requests</h4>
                        {guildRequests.map(r => (
                            <div key={r.user_id} className="flex justify-between items-center border p-1 rounded mb-1">
                                <span>{r.username}</span>
                                <BubbleButton onClick={() => handleApproveGuild(r.user_id)}>Approve</BubbleButton>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Quests & Parties */}
            <div className="flex-1 flex flex-col gap-4">
                
                {/* Code */}
                {/* Copy Guild Join Code */}
                {guild?.join_code && (
                    <div className="flex items-center justify-between mb-2 p-2 border rounded bg-gray-50">
                        <span className="font-mono">{guild.join_code}</span>
                        <BubbleButton onClick={() => {
                                navigator.clipboard.writeText(guild.join_code);
                                alert('Join code copied!');
                            }}>Copy</BubbleButton>
                    </div>
                )}

                {/* Guild Quests */}
                <GuildQuestsList
                    initialQuests={quests}
                    guildId={guild.id}
                    isMaster={isMaster}
                />

                {/* Guild Parties */}
                <div className="border p-2 rounded">
                    <h3 className="font-semibold flex justify-between items-center">
                        Guild Parties
                        {isMaster && <BubbleButton onClick={() => setShowPartyForm(!showPartyForm)}>+ Add</BubbleButton>}
                    </h3>

                    {showPartyForm && (
                        <div className="flex gap-1 items-center mt-1">
                            <input
                                placeholder="Party Name"
                                className="border p-1 rounded flex-1"
                                value={newPartyName}
                                onChange={e => setNewPartyName(e.target.value)}
                            />
                            <BubbleButton onClick={handleAddParty}>Create</BubbleButton>
                        </div>
                    )}

                    <div className="mt-2 flex flex-col gap-2">
                        {parties.length ? (
                            parties.map(p => (
                                <div key={p.id} className="border p-2 rounded">
                                    <p className="font-medium">{p.name}</p>
                                    <p className="text-sm text-gray-500">XP: {p.xp_current}/{p.xp_goal}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500">No parties yet</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}