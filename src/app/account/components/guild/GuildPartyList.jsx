'use client';
import React from 'react';

export default function GuildPartyList({ parties }) {
    return (
        <div>
            <h3 className='font-semibold mb-2'>Guild Parties</h3>
            {parties?.length ? (
                parties.map((p) => (
                    <div key={p.id} className='border p-2 mb-2 rounded'>
                        <p>{p.name}</p>
                        <p>XP Progress: {p.xp}/{p.xp_goal}</p>
                    </div>
                ))
            ) : (
                <p className='text-sm text-gray-500'>No current parties</p>
            )}
        </div>
    );
}