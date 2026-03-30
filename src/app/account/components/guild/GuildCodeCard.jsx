'use client';
import React from 'react';
import BubbleButton from '@/components/ui/BubbleButton';

export default function GuildCodeCard({ joinCode, onCopy }) {
    return (
        <div className='flex items-center justify-between mb-2 p-2 border rounded bg-gray-50'>
            <span className='font-mono text-lg font-bold'>{joinCode}</span>
            <BubbleButton onClick={onCopy}>
                Copy
            </BubbleButton>
        </div>
    );
}
