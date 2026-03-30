'use client';
import React from 'react';
import BubbleButton from '@/components/ui/BubbleButton';

export default function MembersList({ members, guildRequests, isMaster, user, onRemoveMember, onApproveGuild, onRejectGuild }) {
    return (
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

            {isMaster && guildRequests.length > 0 && (
                <div className='mt-4'>
                    <h4 className='font-semibold mb-2'>Pending Requests</h4>
                    {guildRequests.map(r => (
                        <div key={r.user_id} className='flex justify-between items-center border p-1 rounded mb-1'>
                            <span>{r.username}</span>
                            <div className='flex gap-1'>
                                <BubbleButton onClick={() => onRejectGuild(r.user_id)} className='bg-gray-400 hover:bg-gray-500'>Decline</BubbleButton>
                                <BubbleButton onClick={() => onApproveGuild(r.user_id)}>Approve</BubbleButton>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
