import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { createActivityLog } from '@/lib/dbHelpers';
import { createNotification } from '@/lib/notificationHelpers';

/**
 * GET /api/tasks
 * Get all tasks with optional filters
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const role = searchParams.get('role');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const assignee = searchParams.get('assignee');
    const search = searchParams.get('search');

    const db = await getDatabase();

    // Build filter based on role and parameters
    let filter = {};

    // Role-based filtering - staff can only see their own tasks
    if (role === 'staff' && userId) {
      filter.assignee = userId;
    }

    // Assignee filter (for team_leader and super_admin)
    if (assignee && assignee !== 'all' && role !== 'staff') {
      filter.assignee = assignee;
    }

    // Status filter
    if (status && status !== 'all') {
      filter.status = status;
    }

    // Priority filter
    if (priority && priority !== 'all') {
      filter.priority = priority;
    }

    // Search filter
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const tasks = await db
      .collection('tasks')
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Get tasks error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 },
    );
  }
}

/**
 * POST /api/tasks
 * Create a new task
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      assignee,
      assigneeName,
      createdBy,
      createdByName,
      creatorRole,
      dueDate,
      priority,
      attachments = [],
    } = body;

    // Validate required fields
    if (
      !title ||
      !description ||
      !assignee ||
      !createdBy ||
      !dueDate ||
      !priority
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    const db = await getDatabase();

    // Permission check: staff can only create tasks for themselves
    // and only if canCreateTask is enabled
    if (creatorRole === 'staff') {
      const creator = await db.collection('users').findOne({ uid: createdBy });
      if (!creator || creator.canCreateTask === false) {
        return NextResponse.json(
          { error: 'You do not have permission to create tasks' },
          { status: 403 },
        );
      }
      // Staff can only assign tasks to themselves
      if (assignee !== createdBy) {
        return NextResponse.json(
          { error: 'Staff members can only create tasks for themselves' },
          { status: 403 },
        );
      }
    }

    // Create task document
    const newTask = {
      title,
      description,
      assignee,
      assigneeName,
      createdBy,
      createdByName,
      dueDate: new Date(dueDate),
      priority,
      status: 'pending',
      attachments,
      completedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('tasks').insertOne(newTask);

    // Create activity log
    await createActivityLog({
      userId: createdBy,
      userName: createdByName,
      actionType: 'task_created',
      taskId: result.insertedId.toString(),
      taskTitle: title,
      description: `created task "${title}"`,
      metadata: { assignee: assigneeName, priority, dueDate },
    });

    // Notify the assigned staff member (only if assigning to someone else)
    if (assignee !== createdBy) {
      await createNotification({
        userId: assignee,
        title: 'New Task Assigned',
        message: `${createdByName} assigned you a new task: "${title}"`,
        type: 'task_assigned',
        taskId: result.insertedId.toString(),
        taskTitle: title,
      });
    }

    return NextResponse.json(
      { message: 'Task created successfully', taskId: result.insertedId },
      { status: 201 },
    );
  } catch (error) {
    console.error('Create task error:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 },
    );
  }
}
