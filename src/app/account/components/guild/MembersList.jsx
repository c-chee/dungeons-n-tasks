'use client';
import React, { useState } from 'react';
import BubbleButton from '@/components/ui/BubbleButton';
import Modal from '../ui/Modal';
import { XIcon } from '../ui/Icons';

export default function MembersList({ members, guildRequests, isMaster, user, onRemoveMember, onApproveGuild, onRejectGuild }) {
    const [showRemoveModal, setShowRemoveModal] = useState(false);
    const [memberToRemove, setMemberToRemove] = useState(null);

    const handleRemoveClick = (memberId) => {
        setMemberToRemove(memberId);
        setShowRemoveModal(true);
    };

    const confirmRemove = () => {
        if (memberToRemove && onRemoveMember) {
            onRemoveMember(memberToRemove);
        }
        setShowRemoveModal(false);
        setMemberToRemove(null);
    };

    return (
        <div className='flex-1 border p-2 rounded max-h-[500px] overflow-y-auto bg-white'>
            <h3 className='font-semibold mb-2'>Members</h3>
            {members.length ? (
                members.map(m => (
                    <div key={m.id} className='flex items-center gap-2 mb-2'>
                        <div className='w-8 h-8 rounded-full bg-[var(--light-blue)] flex items-center justify-center text-sm font-bold'>
                            {m.first_name?.[0]}{m.last_name?.[0]}
                        </div>
                        <div className='flex-1 min-w-0'>
                            <div className='flex flex-wrap items-center gap-2'>
                                <p className='truncate max-w-[120px]'>{m.first_name} {m.last_name}</p>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${
                                    m.role === 'guild_master' 
                                        ? 'bg-yellow-500 text-white' 
                                        : 'bg-gray-200 text-gray-700'
                                }`}>
                                    {m.role === 'guild_master' ? 'Master' : 'Member'}
                                </span>
                                {m.party_name && (
                                    <span className='text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap bg-purple-100 text-purple-700'>
                                        {m.party_name}
                                    </span>
                                )}
                            </div>
                            <p className='text-sm text-gray-500'>Level {m.level}</p>
                        </div>
                        {isMaster && m.id !== user?.id && onRemoveMember && (
                            <button 
                                onClick={() => handleRemoveClick(m.id)}
                                className='text-red-400 hover:text-red-600 cursor-pointer'
                                title='Remove member'
                            >
                                <XIcon size={18} />
                            </button>
                        )}
                    </div>
                ))
            ) : (
                <p className='text-sm text-gray-500'>No members yet</p>
            )}

            {isMaster && guildRequests.length > 0 && (
                <div className='mt-4'>
                    <h4 className=' text-sm font-semibold mb-2'>Pending Requests</h4>
                    {guildRequests.map(r => (
                        <div key={r.user_id} className='flex justify-between items-center border border-orange-600 p-3 rounded mb-1 bg-orange-100
                        '>
                            <span>{r.username}</span>
                            <div className='flex gap-1'>
                                <BubbleButton onClick={() => onApproveGuild(r.user_id)}>Accept</BubbleButton>
                                <BubbleButton onClick={() => onRejectGuild(r.user_id)} variant='red'>Decline</BubbleButton>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Remove Confirmation Modal */}
            <Modal isOpen={showRemoveModal} onClose={() => setShowRemoveModal(false)}>
                <h2 className='font-bold text-lg mb-4'>Remove Member?</h2>
                <p className='text-gray-600 mb-4'>
                    Are you sure you want to remove this member?
                </p>
                <div className='flex gap-2'>
                    <BubbleButton onClick={confirmRemove} variant='red'>Yes, Remove</BubbleButton>
                    <BubbleButton onClick={() => setShowRemoveModal(false)}>Cancel</BubbleButton>
                </div>
            </Modal>
        </div>
    );
}
