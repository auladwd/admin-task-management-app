import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

/**
 * POST /api/reports/generate
 * Generate report based on filters
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { dateRange, status, priority, assignee, startDate, endDate } = body;

    const db = await getDatabase();
    let filter = {};

    // Date range filter
    if (dateRange === 'custom' && startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    } else if (dateRange === 'last7days') {
      const date = new Date();
      date.setDate(date.getDate() - 7);
      filter.createdAt = { $gte: date };
    } else if (dateRange === 'last30days') {
      const date = new Date();
      date.setDate(date.getDate() - 30);
      filter.createdAt = { $gte: date };
    } else if (dateRange === 'last3months') {
      const date = new Date();
      date.setMonth(date.getMonth() - 3);
      filter.createdAt = { $gte: date };
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

    // Fetch tasks
    const tasks = await db
      .collection('tasks')
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    // Calculate statistics
    const stats = {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'pending').length,
      inProgress: tasks.filter(t => t.status === 'in_progress').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      high: tasks.filter(t => t.priority === 'high').length,
      medium: tasks.filter(t => t.priority === 'medium').length,
      low: tasks.filter(t => t.priority === 'low').length,
      overdue: tasks.filter(
        t => t.status !== 'completed' && new Date(t.dueDate) < new Date(),
      ).length,
    };

    return NextResponse.json({ tasks, stats, filters: body });
  } catch (error) {
    console.error('Generate report error:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 },
    );
  }
}
