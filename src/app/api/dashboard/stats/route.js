import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

/**
 * GET /api/dashboard/stats
 * Get dashboard statistics
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const role = searchParams.get('role');

    const db = await getDatabase();
    const now = new Date();

    let stats = {};

    if (role === 'staff' && userId) {
      // Staff: Only their assigned tasks
      const total = await db
        .collection('tasks')
        .countDocuments({ assignee: userId });
      const pending = await db
        .collection('tasks')
        .countDocuments({ assignee: userId, status: 'pending' });
      const inProgress = await db
        .collection('tasks')
        .countDocuments({ assignee: userId, status: 'in_progress' });
      const completed = await db
        .collection('tasks')
        .countDocuments({ assignee: userId, status: 'completed' });
      const overdue = await db.collection('tasks').countDocuments({
        assignee: userId,
        status: { $ne: 'completed' },
        dueDate: { $lt: now },
      });

      stats = { total, pending, inProgress, completed, overdue };
    } else {
      // Super Admin & Team Leader: All tasks
      const total = await db.collection('tasks').countDocuments();
      const pending = await db
        .collection('tasks')
        .countDocuments({ status: 'pending' });
      const inProgress = await db
        .collection('tasks')
        .countDocuments({ status: 'in_progress' });
      const completed = await db
        .collection('tasks')
        .countDocuments({ status: 'completed' });
      const overdue = await db.collection('tasks').countDocuments({
        status: { $ne: 'completed' },
        dueDate: { $lt: now },
      });

      stats = { total, pending, inProgress, completed, overdue };
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Get stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 },
    );
  }
}
