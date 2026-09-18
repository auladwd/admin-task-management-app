import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import {
  calculateUserPerformance,
  calculateLeaderboard,
} from '@/lib/performanceCalculator';

/**
 * GET /api/performance
 * Accurate, comprehensive performance metrics for all staff (or a specific user)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const roleParam = searchParams.get('role'); // e.g. 'all', 'staff', 'staff,team_leader'

    const db = await getDatabase();

    // If specific user requested
    if (userId) {
      const user = await db.collection('users').findOne({ uid: userId });
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      const perf = await calculateUserPerformance(db, user);
      return NextResponse.json(perf);
    }

    // Determine roles to evaluate
    let roles = ['staff'];
    if (roleParam === 'all') {
      roles = ['staff', 'team_leader'];
    } else if (roleParam) {
      roles = roleParam.split(',').map(r => r.trim()).filter(Boolean);
    }

    const performanceData = await calculateLeaderboard(db, {
      roles,
      limit: null, // Return all matching users
    });

    return NextResponse.json(performanceData);
  } catch (error) {
    console.error('Get performance error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch performance data' },
      { status: 500 },
    );
  }
}
