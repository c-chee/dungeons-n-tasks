'use client';
import React from 'react';

export default function GuildMembersList({ members }) {
    return (
        <div className='border rounded p-2 max-h-64 overflow-y-auto'>
            {members?.length ? (
                members.map((m) => (
                    <div key={m.id} className='flex items-center gap-2 border-b p-1'>
                        <div className='w-8 h-8 rounded-full bg-[var(--light-green)] flex items-center justify-center text-sm font-bold'>
                            {m.username?.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span>{m.username}</span>
                        <span className='ml-auto text-sm text-gray-500'>Lvl {m.level}</span>
                    </div>
                ))
            ) : (
                <p className='text-sm text-gray-500'>No members</p>
            )}
        </div>
    );
}