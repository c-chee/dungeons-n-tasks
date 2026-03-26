import Card from './Card';
import BubbleButton from '@/components/ui/BubbleButton';

export default function RequestsCard({ title, requests, onApprove, variant }) {
    if (!requests || requests.length === 0) return null;

    return (
        <Card variant={variant}>
        <h2 className='font-bold'>{title}</h2>
        <div className='mt-2 flex flex-col gap-2'>
            {requests.map((r) => (
            <div key={r.user_id} className='flex justify-between items-center'>
                <span>{r.username}</span>
                <BubbleButton onClick={() => onApprove(r.user_id)}>Approve</BubbleButton>
            </div>
            ))}
        </div>
        </Card>
    );
}