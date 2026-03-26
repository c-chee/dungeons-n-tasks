/**
 * Server side
 * - Pulled from DB
 * - Based on JWT
 */
import { getUserFromToken } from '@/lib/getUserFromToken';
import { getDashboardData } from '@/lib/getDashboardData';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
    // 1. Get authenticated user from token
    const authUser = await getUserFromToken();
    console.log('Auth user:', authUser);

    // 2. Unauthorized fallback
    if (!authUser) {
        return <div>Unauthorized</div>;
    }

    // 3. Fetch dashboard data
    const data = await getDashboardData(authUser.id);
    console.log('Dashboard data:', data);

    // 4. Render client component
    return <DashboardClient data={data} />;
}