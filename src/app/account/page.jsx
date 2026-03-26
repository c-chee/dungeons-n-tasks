/**
 * Server side
 * - Pulled from DB
 * - Based on JWT
 */
import { getUserFromToken } from '@/lib/getUserFromToken';
import { getDashboardData } from '@/lib/getDashboardData';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  const authUser = getUserFromToken();
  console.log('Auth user:', authUser);

  if (!authUser) {
    return <div>Unauthorized</div>;
  }

  const data = await getDashboardData(authUser.id);
  console.log('Dashboard data:', data);

  return <DashboardClient data={data} />;
}