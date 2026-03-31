import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

/**
 * PUT /api/notifications/read
 * Mark one or all notifications as read
 * Body: { userId, notificationId? }  — if no notificationId, marks all as read
 */
export async function PUT(request) {
  try {
    const { userId, notificationId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 },
      );
    }

    const db = await getDatabase();

    if (notificationId && ObjectId.isValid(notificationId)) {
      // Mark single notification as read
      await db
        .collection('notifications')
        .updateOne(
          { _id: new ObjectId(notificationId), userId },
          { $set: { isRead: true } },
        );
    } else {
      // Mark all notifications as read for this user
      await db
        .collection('notifications')
        .updateMany({ userId, isRead: false }, { $set: { isRead: true } });
    }

    return NextResponse.json({ message: 'Marked as read' });
  } catch (error) {
    console.error('Mark read error:', error);
    return NextResponse.json(
      { error: 'Failed to update notifications' },
      { status: 500 },
    );
  }
}
