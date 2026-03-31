import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { createActivityLog } from '@/lib/dbHelpers';
import { createNotification } from '@/lib/notificationHelpers';

/**
 * GET /api/tasks/[id]
 * Get a single task by ID
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid task ID' }, { status: 400 });
    }

    const db = await getDatabase();
    const task = await db
      .collection('tasks')
      .findOne({ _id: new ObjectId(id) });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Get comments for this task
    const comments = await db
      .collection('comments')
      .find({ taskId: new ObjectId(id) })
      .sort({ createdAt: 1 })
      .toArray();

    return NextResponse.json({ task, comments });
  } catch (error) {
    console.error('Get task error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch task' },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/tasks/[id]
 * Update a task
 */
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid task ID' }, { status: 400 });
    }

    const db = await getDatabase();

    // Get current task
    const currentTask = await db
      .collection('tasks')
      .findOne({ _id: new ObjectId(id) });
    if (!currentTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Build update object
    const updateData = {
      ...body,
      updatedAt: new Date(),
    };

    // If status changed to completed, set completedAt
    if (body.status === 'completed' && currentTask.status !== 'completed') {
      updateData.completedAt = new Date();
    }

    // If dueDate is provided, convert to Date
    if (body.dueDate) {
      updateData.dueDate = new Date(body.dueDate);
    }

    // Update task
    await db
      .collection('tasks')
      .updateOne({ _id: new ObjectId(id) }, { $set: updateData });

    // Create activity log
    let actionType = 'task_updated';
    let description = `updated task "${currentTask.title}"`;

    if (body.status && body.status !== currentTask.status) {
      actionType =
        body.status === 'completed' ? 'task_completed' : 'status_changed';
      description = `changed status to "${body.status}" for task "${currentTask.title}"`;
    }

    await createActivityLog({
      userId: body.updatedBy || currentTask.createdBy,
      userName: body.updatedByName || currentTask.createdByName,
      actionType,
      taskId: id,
      taskTitle: currentTask.title,
      description,
      metadata: {
        oldStatus: currentTask.status,
        newStatus: body.status,
      },
    });

    // --- Notifications ---
    const updatedBy = body.updatedBy || currentTask.createdBy;
    const updatedByName = body.updatedByName || currentTask.createdByName;

    // Status changed: notify the task creator (if different from updater)
    if (body.status && body.status !== currentTask.status) {
      const statusLabels = {
        pending: 'Pending',
        in_progress: 'In Progress',
        completed: 'Completed',
      };

      // Notify creator when staff updates status
      if (updatedBy !== currentTask.createdBy) {
        await createNotification({
          userId: currentTask.createdBy,
          title: 'Task Status Updated',
          message: `${updatedByName} changed "${currentTask.title}" to ${statusLabels[body.status] || body.status}`,
          type: 'status_changed',
          taskId: id,
          taskTitle: currentTask.title,
        });
      }

      // Notify assignee when team leader changes status (if different from updater)
      if (updatedBy !== currentTask.assignee && currentTask.assignee) {
        await createNotification({
          userId: currentTask.assignee,
          title: 'Task Status Updated',
          message: `"${currentTask.title}" status changed to ${statusLabels[body.status] || body.status}`,
          type: 'status_changed',
          taskId: id,
          taskTitle: currentTask.title,
        });
      }
    }

    // Task reassigned: notify new assignee
    if (body.assignee && body.assignee !== currentTask.assignee) {
      await createNotification({
        userId: body.assignee,
        title: 'Task Assigned to You',
        message: `${updatedByName} assigned you the task: "${currentTask.title}"`,
        type: 'task_assigned',
        taskId: id,
        taskTitle: currentTask.title,
      });
    }

    return NextResponse.json({ message: 'Task updated successfully' });
  } catch (error) {
    console.error('Update task error:', error);
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/tasks/[id]
 * Delete a task
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid task ID' }, { status: 400 });
    }

    const db = await getDatabase();

    // Get task before deleting
    const task = await db
      .collection('tasks')
      .findOne({ _id: new ObjectId(id) });
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Delete task
    await db.collection('tasks').deleteOne({ _id: new ObjectId(id) });

    // Delete associated comments
    await db.collection('comments').deleteMany({ taskId: new ObjectId(id) });

    return NextResponse.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 },
    );
  }
}
