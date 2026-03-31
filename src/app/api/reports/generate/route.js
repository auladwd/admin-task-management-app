import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

/**
 * GET /api/reports/generate
 * Generate report based on filters
 * Staff users can only see their own tasks (enforced via userId + role params)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const assignee = searchParams.get('assignee');
    const userId = searchParams.get('userId'); // current user's UID
    const role = searchParams.get('role'); // current user's role

    const db = await getDatabase();
    let filter = {};

    // ── Role-based access control ──────────────────────────────────────
    // Staff can ONLY see their own tasks — override any assignee param
    if (role === 'staff' && userId) {
      filter.assignee = userId;
    } else if (assignee && assignee !== 'all') {
      filter.assignee = assignee;
    }

    // Date range filter (matches against createdAt)
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    // Status filter
    if (status && status !== 'all') filter.status = status;

    // Priority filter
    if (priority && priority !== 'all') filter.priority = priority;

    // Fetch tasks
    const tasks = await db
      .collection('tasks')
      .aggregate([
        { $match: filter },
        {
          $lookup: {
            from: 'users',
            localField: 'assignee',
            foreignField: 'uid',
            as: 'assigneeDetails',
          },
        },
        {
          $addFields: {
            assigneeName: {
              $ifNull: [
                { $arrayElemAt: ['$assigneeDetails.name', 0] },
                'Unassigned',
              ],
            },
          },
        },
        { $project: { assigneeDetails: 0 } },
        { $sort: { createdAt: -1 } },
      ])
      .toArray();

    // Summary statistics
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const inProgressTasks = tasks.filter(
      t => t.status === 'in_progress',
    ).length;
    const pendingTasks = tasks.filter(t => t.status === 'pending').length;
    const completionRate =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const overdueTasks = tasks.filter(
      t => t.status !== 'completed' && new Date(t.dueDate) < new Date(),
    ).length;

    const summary = {
      totalTasks,
      completedTasks,
      inProgressTasks,
      pendingTasks,
      completionRate,
      overdueTasks,
      highPriority: tasks.filter(t => t.priority === 'high').length,
      mediumPriority: tasks.filter(t => t.priority === 'medium').length,
      lowPriority: tasks.filter(t => t.priority === 'low').length,
    };

    return NextResponse.json({
      tasks,
      summary,
      filters: { startDate, endDate, status, priority, assignee },
    });
  } catch (error) {
    console.error('Generate report error:', error);
    return NextResponse.json(
      { error: 'Failed to generate report', details: error.message },
      { status: 500 },
    );
  }
}
