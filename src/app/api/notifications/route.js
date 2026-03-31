import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

/**
 * GET /api/notifications?userId=xxx&limit=20
 * Fetch notifications for a user
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 },
      );
    }

    const db = await getDatabase();

    const notifications = await db
      .collection('notifications')
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    const unreadCount = await db
      .collection('notifications')
      .countDocuments({ userId, isRead: false });

    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    console.error('Get notifications error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 },
    );
  }
}
