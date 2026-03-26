'use client';
import { useState } from 'react';
import Card from '../cards/Card';
import GuildMembersList from './GuildMembersList';
import GuildQuestsList from './GuildQuestList';
import GuildPartyList from './GuildPartyList';
import GuildJoinRequests from './GuildJoinRequests';

export default function GuildContainer({ user, guild, guildQuests, guildRequests, joinCode, onApprove }) {
    const isMaster = guild?.role === 'guild_master';
    const [showMembers, setShowMembers] = useState(true);

    const handleReject = (userId) => {
        console.log('Reject user', userId);
    };

    return (
        <Card variant='blue' className='p-4'>
            {/* Guild Header */}
            <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2'>
                <h2 className='text-xl font-bold'>{guild.name}</h2>
                {isMaster && (
                    <div className='flex items-center gap-2 w-full sm:w-auto'>
                        <input
                            type='text'
                            value={joinCode || ''}
                            readOnly
                            className='border p-1 rounded bg-gray-100 flex-1'
                        />
                        <button onClick={() => navigator.clipboard.writeText(joinCode)} className='px-2 py-1 bg-blue-500 text-white rounded'>
                            Copy Code
                        </button>
                    </div>
                )}
            </div>

            {/* Responsive Layout */}
            <div className='flex flex-col md:flex-row gap-4'>
                {/* Left: Members */}
                <div className='md:w-1/3'>
                    <div className='flex justify-between items-center mb-2'>
                        <h3 className='font-semibold'>Members</h3>
                        <button onClick={() => setShowMembers(!showMembers)} className='text-sm underline'>
                            {showMembers ? 'Hide' : 'Show'}
                        </button>
                    </div>
                    {showMembers && <GuildMembersList members={guild.members} />}
                </div>

                {/* Right: Quests, Parties, Requests */}
                <div className='md:w-2/3 flex flex-col gap-4'>
                    <GuildQuestsList initialQuests={guildQuests} isMaster={isMaster} guildId={guild.guild_id} />
                    <GuildPartyList parties={guild.parties} />
                    {isMaster && <GuildJoinRequests requests={guildRequests} onApprove={onApprove} onReject={handleReject} />}
                </div>
            </div>
        </Card>
    );
}