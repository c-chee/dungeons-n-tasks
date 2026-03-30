export default function Toolbar({ view, setView }) {
    return (
        <div className='fixed bottom-0 left-0 w-full bg-[var(--dark-brown)] arcade text-white flex justify-around p-4'>

            <button
                onClick={() => setView('quests')}
                className={view === 'quests' ? 'font-bold text-[var(--yellow)] cursor-pointer' : 'cursor-pointer'}
            >
                Quest Board
            </button>

            <button
                onClick={() => setView('home')}
                className={view === 'home' ? 'font-bold text-[var(--yellow)] cursor-pointer' : 'cursor-pointer'}
            >
                Home
            </button>

            <button disabled className='opacity-50'>
                Shop [Coming soon!]
            </button>

        </div>
    );
}