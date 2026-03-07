import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

/**
 * GET /api/users/staff
 * Get all users (for user management)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const staffOnly = searchParams.get('staffOnly') === 'true';

    const db = await getDatabase();

    const query = staffOnly
      ? { role: { $in: ['staff', 'team_leader'] }, isActive: true }
      : { isActive: true };

    const users = await db
      .collection('users')
      .find(query)
      .project({
        userId: '$uid',
        uid: 1,
        name: 1,
        email: 1,
        role: 1,
        createdAt: 1,
      })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/users/staff
 * Update user information
 */
export async function PUT(request) {
  try {
    const body = await request.json();
    const { userId, name, role } = body;

    if (!userId || !name || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    const db = await getDatabase();

    const result = await db.collection('users').updateOne(
      { uid: userId },
      {
        $set: {
          name,
          role,
          updatedAt: new Date(),
        },
      },
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/users/staff
 * Soft delete user (mark as inactive)
 */
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 },
      );
    }

    const db = await getDatabase();

    // Soft delete - mark as inactive
    const result = await db.collection('users').updateOne(
      { uid: userId },
      {
        $set: {
          isActive: false,
          deletedAt: new Date(),
        },
      },
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 },
    );
  }
}
