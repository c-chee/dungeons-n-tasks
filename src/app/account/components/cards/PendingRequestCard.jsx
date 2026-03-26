'use client';
import Card from './Card';
import BubbleButton from '@/components/ui/BubbleButton';

export default function PendingRequestCard({ requests, onCancel }) {
    if (!requests || requests.length === 0) return null;

    return (
        <Card variant='blueDark'>
            <h2 className='font-bold text-lg mb-2'>Pending Guild Requests</h2>
            <p className='text-sm text-gray-600 mb-3'>You have requested to join the following guilds:</p>
            
            <div className='flex flex-col gap-2'>
                {requests.map((req) => (
                    <div 
                        key={req.guild_id} 
                        className='flex items-center justify-between p-2 bg-white/50 rounded border'
                    >
                        <div>
                            <p className='font-medium'>{req.name}</p>
                            <p className='text-sm text-yellow-600'>Awaiting approval...</p>
                        </div>
                        {onCancel && (
                            <BubbleButton 
                                onClick={() => onCancel(req.guild_id)}
                                className='bg-gray-400 text-white hover:bg-gray-500 text-xs'
                            >
                                Cancel
                            </BubbleButton>
                        )}
                    </div>
                ))}
            </div>
        </Card>
    );
}
