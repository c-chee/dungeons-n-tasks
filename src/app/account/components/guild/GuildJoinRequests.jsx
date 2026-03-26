'use client';
import React from 'react';
import BubbleButton from '@/components/ui/BubbleButton';

export default function GuildJoinRequests({ requests, onApprove, onReject }) {
    if (!requests?.length) return null;

    return (
        <div>
            <h3 className='font-semibold mb-2'>Join Requests</h3>
            {requests.map((r) => (
                <div key={r.user_id} className='flex justify-between items-center border p-2 rounded mb-2'>
                    <span>{r.username}</span>
                    <div className='flex gap-2'>
                        <BubbleButton onClick={() => onApprove(r.user_id)}>✔</BubbleButton>
                        <BubbleButton onClick={() => onReject(r.user_id)}>✖</BubbleButton>
                    </div>
                </div>
            ))}
        </div>
    );
}