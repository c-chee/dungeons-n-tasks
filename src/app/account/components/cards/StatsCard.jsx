import Card from './Card';

export default function StatsCard({ coins, level }) {
    return (
        <Card variant='default'>
        <h2 className='font-bold text-lg'>Your Stats</h2>
        <p>Coins: {coins}</p>
        <p>Level: {level}</p>
        </Card>
    );
}