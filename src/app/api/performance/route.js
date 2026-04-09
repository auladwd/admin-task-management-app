import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

/**
 * GET /api/performance
 * Accurate performance metrics for all staff (or a specific user)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const db = await getDatabase();

    if (userId) {
      const user = await db.collection('users').findOne({ uid: userId });
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      const perf = await calculateUserPerformance(db, user);
      return NextResponse.json(perf);
    }

    // All active staff
    const staffUsers = await db
      .collection('users')
      .find({ role: 'staff', isActive: true })
      .toArray();

    const performanceData = await Promise.all(
      staffUsers.map(user => calculateUserPerformance(db, user)),
    );

    // Rank by score (highest first)
    performanceData.sort((a, b) => b.score - a.score);
    performanceData.forEach((p, i) => {
      p.rank = i + 1;
    });

    return NextResponse.json(performanceData);
  } catch (error) {
    console.error('Get performance error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch performance data' },
      { status: 500 },
    );
  }
}

/**
 * Calculate accurate performance metrics for a single user.
 *
 * Score formula (0–100):
 *   +60 pts  → Completion Rate   (completed / assigned)
 *   +30 pts  → On-Time Rate      (completed on time / completed)
 *   -10 pts  → Overdue Penalty   (overdue / assigned)
 *
 * "Completed on time" = completedAt <= dueDate  AND  completedAt is not null
 * "Overdue"           = status != 'completed'   AND  dueDate < now
 */
async function calculateUserPerformance(db, user) {
  const uid = user.uid;
  const now = new Date();

  // Fetch all tasks assigned to this user in one query
  const tasks = await db
    .collection('tasks')
    .find({ assignee: uid })
    .project({ status: 1, dueDate: 1, completedAt: 1, priority: 1, title: 1 })
    .toArray();

  const assigned = tasks.length;
  const completed = tasks.filter(t => t.status === 'completed').length;
  const inProgress = tasks.filter(t => t.status === 'in_progress').length;
  const pending = tasks.filter(t => t.status === 'pending').length;

  // On-time: completed AND completedAt exists AND completedAt <= dueDate
  const completedOnTime = tasks.filter(
    t =>
      t.status === 'completed' &&
      t.completedAt &&
      new Date(t.completedAt) <= new Date(t.dueDate),
  ).length;

  // Late completions: completed but after deadline
  const completedLate = completed - completedOnTime;

  // Overdue: not completed AND past due date
  const overdue = tasks.filter(
    t => t.status !== 'completed' && t.dueDate && new Date(t.dueDate) < now,
  ).length;

  // Priority breakdown
  const highPriority = tasks.filter(t => t.priority === 'high').length;
  const mediumPriority = tasks.filter(t => t.priority === 'medium').length;
  const lowPriority = tasks.filter(t => t.priority === 'low').length;

  // Rates (avoid division by zero)
  const completionRate =
    assigned > 0
      ? Math.round((completed / assigned) * 10000) / 100 // 2 decimal places
      : 0;

  const onTimeRate =
    completed > 0 ? Math.round((completedOnTime / completed) * 10000) / 100 : 0;

  const overdueRate =
    assigned > 0 ? Math.round((overdue / assigned) * 10000) / 100 : 0;

  // Score calculation
  let score = 0;
  if (assigned > 0) {
    score += completionRate * 0.6; // max 60 pts
    score += onTimeRate * 0.3; // max 30 pts
    score -= overdueRate * 0.1; // max -10 pts
    score = Math.max(0, Math.min(100, score));
  }

  // Grade label
  let grade, gradeColor;
  if (score >= 90) {
    grade = 'Excellent';
    gradeColor = 'success';
  } else if (score >= 75) {
    grade = 'Good';
    gradeColor = 'info';
  } else if (score >= 60) {
    grade = 'Average';
    gradeColor = 'warning';
  } else if (score >= 40) {
    grade = 'Below Average';
    gradeColor = 'warning';
  } else {
    grade = 'Needs Improvement';
    gradeColor = 'error';
  }

  return {
    // User info
    uid: user.uid,
    name: user.name,
    email: user.email,
    role: user.role,

    // Task counts
    assigned,
    completed,
    completedOnTime,
    completedLate,
    inProgress,
    pending,
    overdue,

    // Priority breakdown
    highPriority,
    mediumPriority,
    lowPriority,

    // Rates
    completionRate,
    onTimeRate,
    overdueRate,

    // Score
    score: Math.round(score * 100) / 100,
    grade,
    gradeColor,
  };
}
