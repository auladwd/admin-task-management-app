import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

/**
 * GET /api/performance
 * Get detailed performance metrics for all staff or specific user
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const db = await getDatabase();

    if (userId) {
      // Get performance for specific user
      const user = await db.collection('users').findOne({ uid: userId });
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      const performance = await calculateUserPerformance(db, userId);
      return NextResponse.json({ ...user, ...performance });
    } else {
      // Get performance for all staff
      const staffUsers = await db
        .collection('users')
        .find({ role: 'staff', isActive: true })
        .toArray();

      const performanceData = await Promise.all(
        staffUsers.map(async user => {
          const perf = await calculateUserPerformance(db, user.uid);
          return { ...user, ...perf };
        }),
      );

      return NextResponse.json(performanceData);
    }
  } catch (error) {
    console.error('Get performance error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch performance data' },
      { status: 500 },
    );
  }
}

async function calculateUserPerformance(db, userId) {
  const assigned = await db
    .collection('tasks')
    .countDocuments({ assignee: userId });
  const completed = await db.collection('tasks').countDocuments({
    assignee: userId,
    status: 'completed',
  });
  const completedOnTime = await db.collection('tasks').countDocuments({
    assignee: userId,
    status: 'completed',
    $expr: { $lte: ['$completedAt', '$dueDate'] },
  });
  const overdue = await db.collection('tasks').countDocuments({
    assignee: userId,
    status: { $ne: 'completed' },
    dueDate: { $lt: new Date() },
  });

  let score = 0;
  if (assigned > 0) {
    const completionRate = (completed / assigned) * 100;
    const onTimeRate = completed > 0 ? (completedOnTime / completed) * 100 : 0;
    score += completionRate * 0.6;
    score += onTimeRate * 0.3;
    const overdueRate = (overdue / assigned) * 100;
    score -= overdueRate * 0.1;
    score = Math.max(0, Math.min(100, score));
  }

  return {
    assigned,
    completed,
    completedOnTime,
    overdue,
    completionRate: assigned > 0 ? (completed / assigned) * 100 : 0,
    onTimeRate: completed > 0 ? (completedOnTime / completed) * 100 : 0,
    score: Math.round(score * 100) / 100,
  };
}
