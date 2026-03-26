import Card from './Card';
import BubbleButton from '@/components/ui/BubbleButton';

export default function JoinCard({ type, code, setCode, onJoin }) {
    const title = type === 'guild' ? 'Join a Guild' : 'Join a Party';
    const variant = type === 'guild' ? 'blue' : 'green';

    return (
        <Card 
            variant={variant}
        >
            <h2 className='font-bold'>{title}</h2>
            <div className='flex gap-2 mt-2'>
                <input
                type='text'
                placeholder={`Enter ${type} code`}
                className='border p-1 rounded flex-1'
                value={code}
                onChange={(e) => setCode(e.target.value)}
                />
                    <BubbleButton onClick={onJoin}>Join</BubbleButton>
            </div>
        </Card>
    );
}