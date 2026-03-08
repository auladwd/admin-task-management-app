import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

/**
 * GET /api/reports/generate
 * Generate report based on filters
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const assignee = searchParams.get('assignee');

    const db = await getDatabase();
    let filter = {};

    // Date range filter
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // Status filter
    if (status && status !== 'all') {
      filter.status = status;
    }

    // Priority filter
    if (priority && priority !== 'all') {
      filter.priority = priority;
    }

    // Assignee filter
    if (assignee && assignee !== 'all') {
      filter.assignee = assignee;
    }

    // Fetch tasks with assignee details
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
        {
          $project: {
            assigneeDetails: 0,
          },
        },
        { $sort: { createdAt: -1 } },
      ])
      .toArray();

    // Calculate summary statistics
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const inProgressTasks = tasks.filter(
      t => t.status === 'in_progress',
    ).length;
    const pendingTasks = tasks.filter(t => t.status === 'pending').length;
    const completionRate =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const summary = {
      totalTasks,
      completedTasks,
      inProgressTasks,
      pendingTasks,
      completionRate,
      highPriority: tasks.filter(t => t.priority === 'high').length,
      mediumPriority: tasks.filter(t => t.priority === 'medium').length,
      lowPriority: tasks.filter(t => t.priority === 'low').length,
      overdue: tasks.filter(
        t => t.status !== 'completed' && new Date(t.dueDate) < new Date(),
      ).length,
    };

    return NextResponse.json({
      tasks,
      summary,
      filters: {
        startDate,
        endDate,
        status,
        priority,
        assignee,
      },
    });
  } catch (error) {
    console.error('Generate report error:', error);
    return NextResponse.json(
      { error: 'Failed to generate report', details: error.message },
      { status: 500 },
    );
  }
}
