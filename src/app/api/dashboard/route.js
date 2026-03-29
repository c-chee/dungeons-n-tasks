import { getUserFromToken } from '@/lib/getUserFromToken';
import { getDashboardData } from '@/lib/getDashboardData';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const user = await getUserFromToken();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await getDashboardData(user.id);

        return NextResponse.json(data);

    } catch (err) {
        console.log('Dashboard API error:', err);
        return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
    }
}
