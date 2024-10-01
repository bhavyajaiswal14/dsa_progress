import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { startOfDay, subYears, endOfDay } from 'date-fns'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const userId = cookies().get('userId')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Adjust for IST (Indian Standard Time)
    const todayUTC = new Date();
    const todayIST = new Date(todayUTC.getTime() + 330 * 60000); // Add 330 minutes to convert to IST

    const todayEnd = endOfDay(todayIST);
    const oneYearAgo = startOfDay(subYears(todayEnd, 1));

    const activities = await prisma.activity.findMany({
      where: {
        userId: userId,
        createdAt: {
          gte: oneYearAgo,
          lte: todayEnd
        }
      },
      select: {
        createdAt: true,
        count: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    const heatmapData = activities.map(activity => {
      const createdAt = new Date(activity.createdAt);

      // Adjust the time to IST (Indian Standard Time) for each activity
      const offsetInMinutes = createdAt.getTimezoneOffset() + 330; // Adjust for IST
      createdAt.setMinutes(createdAt.getMinutes() + offsetInMinutes);

      return {
        date: createdAt.toISOString().split('T')[0], // 'YYYY-MM-DD' format in IST
        count: activity.count
      };
    });

    return NextResponse.json(heatmapData);
  } catch (error) {
    console.error('Heatmap data fetch error:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching heatmap data' },
      { status: 500 }
    );
  }
}
