'use client';

import React, { useState } from 'react';
import Modal from '../ui/Modal';
import BubbleButton from '@/components/ui/BubbleButton';

const StarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
);

export default function PartyCreationModal({ isOpen, onClose, onSuccess, members = [], existingParty = null }) {
    const isEdit = !!existingParty?.id;
    const [name, setName] = useState(existingParty?.name || '');
    const [leaderId, setLeaderId] = useState(existingParty?.leader_id || '');
    const [selectedMembers, setSelectedMembers] = useState(
        existingParty?.members?.map(m => m.user_id) || []
    );
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleMemberToggle = (memberId) => {
        setSelectedMembers(prev => {
            if (prev.includes(memberId)) {
                return prev.filter(id => id !== memberId);
            }
            if (prev.length >= 15) {
                setError('Maximum 15 members per party');
                return prev;
            }
            return [...prev, memberId];
        });
        setError('');
    };

    const handleSubmit = async () => {
        if (!name.trim()) {
            setError('Party name is required');
            return;
        }

        setLoading(true);
        setError('');

        try {
            if (isEdit) {
                const addMembers = selectedMembers.filter(
                    id => !existingParty.members?.some(m => m.user_id === id)
                );
                const removeMembers = existingParty.members
                    ?.filter(m => !selectedMembers.includes(m.user_id))
                    .map(m => m.user_id) || [];

                const res = await fetch('/api/party/update', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        partyId: existingParty.id,
                        action: 'update',
                        name: name.trim(),
                        leaderId: leaderId || null,
                        addMemberIds: addMembers,
                        removeMemberIds: removeMembers
                    })
                });

                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error || 'Failed to update party');
                }
            } else {
                const res = await fetch('/api/party/create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: name.trim(),
                        guildId: existingParty?.guild_id || null,
                        memberIds: selectedMembers,
                        leaderId: leaderId || null
                    })
                });

                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error || 'Failed to create party');
                }
            }

            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Delete this party? This cannot be undone.')) return;

        setLoading(true);
        try {
            const res = await fetch('/api/party/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ partyId: existingParty.id })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to delete party');
            }

            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <h2 className='font-bold text-lg mb-4'>
                {isEdit ? 'Edit Party' : 'Create Party'}
            </h2>

            {error && (
                <div className='mb-4 p-2 bg-red-100 text-red-700 rounded text-sm'>
                    {error}
                </div>
            )}

            <div className='space-y-4'>
                <div>
                    <label className='text-sm font-medium mb-1 block'>Party Name</label>
                    <input
                        type='text'
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder='Enter party name'
                        className='w-full border p-2 rounded'
                    />
                </div>

                <div>
                    <label className='text-sm font-medium mb-1 block'>
                        Leader {leaderId && <span className='text-gray-500'>(Optional)</span>}
                    </label>
                    <select
                        value={leaderId}
                        onChange={(e) => setLeaderId(e.target.value)}
                        className='w-full border p-2 rounded'
                    >
                        <option value=''>No Leader</option>
                        {members.map(m => (
                            <option key={m.id} value={m.id}>
                                {m.first_name} {m.last_name} (Level {m.level})
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <div className='flex justify-between items-center mb-2'>
                        <label className='text-sm font-medium'>Members</label>
                        <span className='text-xs text-gray-500'>
                            {selectedMembers.length}/15
                        </span>
                    </div>
                    <div className='max-h-48 overflow-y-auto border rounded p-2 space-y-1'>
                        {members.length === 0 ? (
                            <p className='text-sm text-gray-500'>No guild members available</p>
                        ) : (
                            members.map(m => (
                                <label 
                                    key={m.id} 
                                    className='flex items-center gap-2 p-1 hover:bg-gray-50 rounded cursor-pointer'
                                >
                                    <input
                                        type='checkbox'
                                        checked={selectedMembers.includes(m.id)}
                                        onChange={() => handleMemberToggle(m.id)}
                                        className='rounded'
                                    />
                                    <span className='text-sm'>
                                        {m.first_name} {m.last_name}
                                    </span>
                                    <span className='text-xs text-gray-400'>
                                        Level {m.level}
                                    </span>
                                    {m.id === leaderId && (
                                        <span className='text-yellow-500'>
                                            <StarIcon />
                                        </span>
                                    )}
                                </label>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <div className='flex justify-between mt-6'>
                <div>
                    {isEdit && (
                        <BubbleButton
                            onClick={handleDelete}
                            disabled={loading}
                            className='bg-red-500 hover:bg-red-600 text-white'
                        >
                            Delete Party
                        </BubbleButton>
                    )}
                </div>
                <div className='flex gap-2'>
                    <BubbleButton onClick={onClose} disabled={loading}>
                        Cancel
                    </BubbleButton>
                    <BubbleButton
                        onClick={handleSubmit}
                        disabled={loading || !name.trim()}
                        className='bg-blue-500 hover:bg-blue-600 text-white'
                    >
                        {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Party'}
                    </BubbleButton>
                </div>
            </div>
        </Modal>
    );
}
