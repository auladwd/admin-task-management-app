import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

/**
 * GET /api/dashboard/activity
 * Get recent activity logs
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    const db = await getDatabase();

    const activities = await db
      .collection('activity_logs')
      .find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    return NextResponse.json(activities);
  } catch (error) {
    console.error('Get activity error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity logs' },
      { status: 500 },
    );
  }
}
