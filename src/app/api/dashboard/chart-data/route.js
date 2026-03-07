import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

/**
 * GET /api/dashboard/chart-data
 * Get data for dashboard charts
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const role = searchParams.get('role');

    const db = await getDatabase();

    // Task distribution by status
    let statusFilter = {};
    if (role === 'staff' && userId) {
      statusFilter = { assignee: userId };
    }

    const pending = await db
      .collection('tasks')
      .countDocuments({ ...statusFilter, status: 'pending' });
    const inProgress = await db
      .collection('tasks')
      .countDocuments({ ...statusFilter, status: 'in_progress' });
    const completed = await db
      .collection('tasks')
      .countDocuments({ ...statusFilter, status: 'completed' });

    const statusDistribution = [
      { name: 'Pending', value: pending, color: '#f59e0b' },
      { name: 'In Progress', value: inProgress, color: '#3b82f6' },
      { name: 'Completed', value: completed, color: '#10b981' },
    ];

    // Tasks completed in last 7 days
    const last7Days = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const filter = {
        ...statusFilter,
        status: 'completed',
        completedAt: {
          $gte: date,
          $lt: nextDate,
        },
      };

      const count = await db.collection('tasks').countDocuments(filter);

      last7Days.push({
        date: date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        tasks: count,
      });
    }

    return NextResponse.json({
      statusDistribution,
      completionTrend: last7Days,
    });
  } catch (error) {
    console.error('Get chart data error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chart data' },
      { status: 500 },
    );
  }
}
