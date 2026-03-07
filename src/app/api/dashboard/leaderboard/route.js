import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

/**
 * GET /api/dashboard/leaderboard
 * Get performance leaderboard
 */
export async function GET() {
  try {
    const db = await getDatabase();

    // Get all staff users
    const staffUsers = await db
      .collection('users')
      .find({ role: 'staff', isActive: true })
      .toArray();

    // Calculate performance for each staff member
    const leaderboard = await Promise.all(
      staffUsers.map(async user => {
        const assigned = await db
          .collection('tasks')
          .countDocuments({ assignee: user.uid });
        const completed = await db.collection('tasks').countDocuments({
          assignee: user.uid,
          status: 'completed',
        });

        const completedOnTime = await db.collection('tasks').countDocuments({
          assignee: user.uid,
          status: 'completed',
          $expr: { $lte: ['$completedAt', '$dueDate'] },
        });

        const overdue = await db.collection('tasks').countDocuments({
          assignee: user.uid,
          status: { $ne: 'completed' },
          dueDate: { $lt: new Date() },
        });

        // Calculate performance score
        let score = 0;
        if (assigned > 0) {
          const completionRate = (completed / assigned) * 100;
          const onTimeRate =
            completed > 0 ? (completedOnTime / completed) * 100 : 0;

          // Base score from completion rate (60% weight)
          score += completionRate * 0.6;

          // Bonus for on-time completion (30% weight)
          score += onTimeRate * 0.3;

          // Penalty for overdue tasks (10% weight)
          const overdueRate = (overdue / assigned) * 100;
          score -= overdueRate * 0.1;

          // Ensure score is between 0 and 100
          score = Math.max(0, Math.min(100, score));
        }

        return {
          userId: user.uid,
          name: user.name,
          email: user.email,
          assigned,
          completed,
          completedOnTime,
          overdue,
          score: Math.round(score * 100) / 100,
        };
      }),
    );

    // Sort by score descending
    leaderboard.sort((a, b) => b.score - a.score);

    // Add rank
    leaderboard.forEach((item, index) => {
      item.rank = index + 1;
    });

    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error('Get leaderboard error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 },
    );
  }
}
