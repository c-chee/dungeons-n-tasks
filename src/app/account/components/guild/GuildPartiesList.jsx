'use client';
import React from 'react';
import BubbleButton from '@/components/ui/BubbleButton';
import { StarIcon, ChevronIcon, XIcon } from '../ui/Icons';

function PartyCard({ party, isExpanded, isMaster, isUserInParty, user, onToggleExpand, onEdit, onRemoveMember }) {
    return (
        <div 
            key={party.id} 
            className={`border p-2 rounded ${isUserInParty ? 'border-green-400 bg-green-50' : ''}`}
        >
            <div 
                className='flex justify-between items-center cursor-pointer'
                onClick={() => onToggleExpand(party.id)}
            >
                <div className='flex-1'>
                    <div className='flex items-center gap-2'>
                        {party.leader_id && (
                            <span className='text-yellow-500'>
                                <StarIcon size={12} />
                            </span>
                        )}
                        <p className='font-medium'>{party.name}</p>
                        {isUserInParty && (
                            <span className='text-xs bg-green-500 text-white px-2 py-0.5 rounded'>
                                Your Party
                            </span>
                        )}
                    </div>
                    <div className='flex items-center gap-2 text-xs text-gray-500 mt-1'>
                        <span>XP Total: {party.xp_current}</span>
                        <span className='text-gray-400'>•</span>
                        <span>{party.member_count || 0}/15 members</span>
                    </div>
                </div>
                <div className='flex items-center gap-2'>
                    {isMaster && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(party);
                            }}
                            className='text-blue-500 hover:text-blue-700 text-xs'
                        >
                            Edit
                        </button>
                    )}
                    <ChevronIcon expanded={isExpanded} size={16} />
                </div>
            </div>

            {isExpanded && party.members?.length > 0 && (
                <div className='mt-2 pt-2 border-t'>
                    <p className='text-xs font-medium text-gray-500 mb-1'>Members:</p>
                    {party.members.map(m => (
                        <div key={m.user_id} className='flex items-center justify-between py-1'>
                            <div className='flex items-center gap-2'>
                                {m.role === 'leader' && (
                                    <span className='text-yellow-500'>
                                        <StarIcon size={12} />
                                    </span>
                                )}
                                <span className='text-sm'>
                                    {m.first_name} {m.last_name}
                                </span>
                                {m.role === 'leader' && (
                                    <span className='text-xs text-gray-400'>(Leader)</span>
                                )}
                            </div>
                            {isMaster && m.user_id !== user?.id && (
                                <button
                                    onClick={() => onRemoveMember(party.id, m.user_id)}
                                    className='text-red-400 hover:text-red-600'
                                    title='Remove from party'
                                >
                                    <XIcon size={14} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function GuildPartiesList({ 
    parties, 
    isMaster, 
    user, 
    expandedParties, 
    onToggleExpand, 
    onEditParty, 
    onRemoveFromParty,
    onCreateParty 
}) {
    return (
        <div className='border p-2 rounded'>
            <h3 className='font-semibold flex justify-between items-center'>
                Guild Parties
                {isMaster && <BubbleButton onClick={onCreateParty}>+ Add</BubbleButton>}
            </h3>

            <div className='mt-2 flex flex-col gap-2'>
                {parties.length ? (
                    parties.map(p => {
                        const isExpanded = expandedParties[p.id];
                        const isUserInParty = p.members?.some(m => m.user_id === user?.id);
                        return (
                            <PartyCard
                                key={p.id}
                                party={p}
                                isExpanded={isExpanded}
                                isMaster={isMaster}
                                isUserInParty={isUserInParty}
                                user={user}
                                onToggleExpand={onToggleExpand}
                                onEdit={onEditParty}
                                onRemoveMember={onRemoveFromParty}
                            />
                        );
                    })
                ) : (
                    <p className='text-sm text-gray-500'>No parties yet</p>
                )}
            </div>
        </div>
    );
}
