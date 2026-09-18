import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { calculateLeaderboard } from '@/lib/performanceCalculator';

/**
 * GET /api/dashboard/leaderboard
 * Get performance leaderboard for active staff using the unified calculation engine.
 */
export async function GET() {
  try {
    const db = await getDatabase();

    const leaderboard = await calculateLeaderboard(db, {
      roles: ['staff'],
      limit: 10,
    });

    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error('Get leaderboard error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 },
    );
  }
}
