/**
 * Client-side navigation
 * - Instant switching, no reload
 */
'use client';
import { useState } from 'react';
import DashboardHome from './components/DashboardHome';
import QuestBoard from './components/QuestBoard';
import Toolbar from './components/Toolbar';

export default function DashboardClient({ data }) {
    const [view, setView] = useState('home');
    const [dashboardData, setDashboardData] = useState(data);

    const refreshDashboard = async () => {
        try {
            const res = await fetch('/api/dashboard');
            if (res.ok) {
                const fresh = await res.json();
                setDashboardData(fresh);
            }
        } catch (err) {
            console.log('Failed to refresh:', err);
        }
    };

    const bgImages = {
        home: '/images/guild.png',
        quests: '/images/quests-bg.png',
        shop: '/images/shop-bg.png',
    };

    return (
        <div
            className='flex flex-col min-h-screen w-full bg-cover bg-center bg-no-repeat '
            style={{ backgroundImage: `url(${bgImages[view]})` }}
        >
            {/* Main content */}
            <div className='flex-1 w-full p-6 mt-[4em]'>
                {view === 'home' && <DashboardHome data={dashboardData} />}
                {view === 'quests' && <QuestBoard data={dashboardData} onRefresh={refreshDashboard} />}
                {view === 'shop' && <div>Shop coming soon</div>}
            </div>

            {/* Toolbar for navigation */}
            <Toolbar view={view} setView={setView} />
        </div>
    );
}