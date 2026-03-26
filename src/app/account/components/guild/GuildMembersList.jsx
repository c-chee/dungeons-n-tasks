'use client';
import React from 'react';

export default function GuildMembersList({ members }) {
    return (
        <div className='border rounded p-2 max-h-64 overflow-y-auto'>
            {members?.length ? (
                members.map((m) => (
                    <div key={m.id} className='flex items-center gap-2 border-b p-1'>
                        <img
                            src={m.avatar || '/images/default-avatar.png'}
                            alt={m.username}
                            className='w-8 h-8 rounded-full'
                        />
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