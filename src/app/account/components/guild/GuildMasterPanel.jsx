'use client';

/**
 * Guild Master Panel
 * - Shows guild name
 * - Shows pending join requests
 * - Placeholder for assigning tasks / parties
 */
export default function GuildMasterPanel({ guildName, requests, onApprove }) {
    return (
        <div className='p-4 bg-blue-600/30 rounded-md border border-blue-800'>
            <h3 className='font-bold text-lg mb-2'>Guild Master Panel</h3>
            <p className='mb-4'>You are the master of <strong>{guildName}</strong>.</p>

            {/* Join Requests */}
            {requests.length > 0 ? (
                <div className='flex flex-col gap-2'>
                    <h4 className='font-semibold'>Pending Join Requests</h4>
                    {requests.map((req) => (
                        <div
                            key={req.user_id}
                            className='flex justify-between items-center bg-white/20 px-2 py-1 rounded'
                        >
                            <span>{req.username}</span>
                            <button
                                onClick={() => onApprove(req.user_id)}
                                className='px-2 py-1 bg-green-500 rounded text-white text-sm'
                            >
                                Approve
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <p>No pending join requests</p>
            )}

            {/* Placeholder: Add assign parties / tasks section */}
            <div className='mt-4 p-2 bg-white/20 rounded'>
                <p className='text-sm italic'>Here you can assign parties and tasks (coming soon)</p>
            </div>
        </div>
    );
}