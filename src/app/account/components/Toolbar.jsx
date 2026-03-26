export default function Toolbar({ view, setView }) {
    return (
        <div className='fixed bottom-0 left-0 w-full bg-[var(--brown)] text-white flex justify-around p-4'>

            <button
                onClick={() => setView('quests')}
                className={view === 'quests' ? 'font-bold underline' : ''}
            >
                Quest Board
            </button>

            <button
                onClick={() => setView('home')}
                className={view === 'home' ? 'font-bold underline' : ''}
            >
                Home
            </button>

            <button disabled className='opacity-50'>
                Shop
            </button>

        </div>
    );
}