import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { createActivityLog } from '@/lib/dbHelpers';

/**
 * POST /api/tasks/[id]/comments
 * Add a comment to a task
 */
export async function POST(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { userId, userName, comment } = body;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid task ID' }, { status: 400 });
    }

    if (!comment || !userId || !userName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    const db = await getDatabase();

    // Check if task exists
    const task = await db
      .collection('tasks')
      .findOne({ _id: new ObjectId(id) });
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Create comment
    const newComment = {
      taskId: new ObjectId(id),
      userId,
      userName,
      comment,
      createdAt: new Date(),
    };

    const result = await db.collection('comments').insertOne(newComment);

    // Create activity log
    await createActivityLog({
      userId,
      userName,
      actionType: 'comment_added',
      taskId: id,
      taskTitle: task.title,
      description: `added a comment on task "${task.title}"`,
      metadata: {
        comment: comment.substring(0, 100),
      },
    });

    return NextResponse.json(
      {
        message: 'Comment added successfully',
        commentId: result.insertedId,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Add comment error:', error);
    return NextResponse.json(
      { error: 'Failed to add comment' },
      { status: 500 },
    );
  }
}
