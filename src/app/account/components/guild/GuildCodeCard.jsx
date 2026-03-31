'use client';
import React from 'react';
import BubbleButton from '@/components/ui/BubbleButton';

export default function GuildCodeCard({ joinCode, onCopy, onRefresh }) {
    return (
        <div className='flex items-center justify-between mb-2 p-2 border rounded bg-white'>
            <span className='font-mono text-lg font-bold'>{joinCode}</span>
            <div className='flex gap-2'>
                {onRefresh && (
                    <BubbleButton onClick={onRefresh} variant='green'>
                        Refresh
                    </BubbleButton>
                )}
                <BubbleButton onClick={onCopy} variant='blue'>
                    Copy
                </BubbleButton>
            </div>
        </div>
    );
}
