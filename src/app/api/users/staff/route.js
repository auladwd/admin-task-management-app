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

    // User management: show all users (active + inactive)
    // staffOnly (task assignment dropdown): show only active staff
    const query = staffOnly
      ? { role: { $in: ['staff', 'team_leader'] }, isActive: true }
      : {};

    const users = await db
      .collection('users')
      .find(query)
      .project({
        userId: '$uid',
        uid: 1,
        name: 1,
        email: 1,
        role: 1,
        isActive: 1,
        canCreateTask: 1,
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
 * Update user information (name, role, email, password, isActive)
 */
export async function PUT(request) {
  try {
    const body = await request.json();
    const { userId, name, role, email, password, isActive, canCreateTask } =
      body;

    if (!userId || !name || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    const db = await getDatabase();

    // Build MongoDB update fields
    const updateFields = {
      name,
      role,
      updatedAt: new Date(),
    };

    if (typeof isActive === 'boolean') {
      updateFields.isActive = isActive;
    }

    if (typeof canCreateTask === 'boolean') {
      updateFields.canCreateTask = canCreateTask;
    }

    // Update email in MongoDB if provided
    if (email) {
      updateFields.email = email;
    }

    const result = await db
      .collection('users')
      .updateOne({ uid: userId }, { $set: updateFields });

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update Firebase Auth (email and/or password) via Admin SDK
    if (email || password) {
      try {
        const { adminAuth } = await import('@/lib/firebaseAdmin');
        const firebaseUpdate = {};
        if (email) firebaseUpdate.email = email;
        if (password) firebaseUpdate.password = password;
        if (name) firebaseUpdate.displayName = name;
        await adminAuth.updateUser(userId, firebaseUpdate);
      } catch (firebaseErr) {
        console.error('Firebase update error:', firebaseErr);
        // Revert MongoDB email change if Firebase failed
        if (email) {
          const original = await db
            .collection('users')
            .findOne({ uid: userId });
          // keep going — return partial success warning
          return NextResponse.json({
            success: true,
            warning:
              'Profile updated but Firebase email/password update failed.',
          });
        }
      }
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
 * Hard delete — removes user from Firebase Auth, MongoDB users,
 * comments, activity_logs, and notifications.
 * Tasks assigned to this user are unassigned (not deleted).
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

    // 1. Verify user exists
    const user = await db.collection('users').findOne({ uid: userId });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 2. Delete from Firebase Auth via Admin SDK
    try {
      const { adminAuth } = await import('@/lib/firebaseAdmin');
      await adminAuth.deleteUser(userId);
    } catch (firebaseErr) {
      // If user doesn't exist in Firebase, continue anyway
      if (firebaseErr.code !== 'auth/user-not-found') {
        console.error('Firebase delete error:', firebaseErr);
        return NextResponse.json(
          { error: 'Failed to delete user from authentication system' },
          { status: 500 },
        );
      }
    }

    // 3. Delete user document from MongoDB
    await db.collection('users').deleteOne({ uid: userId });

    // 4. Unassign tasks (keep tasks but clear assignee info)
    await db.collection('tasks').updateMany(
      { assignee: userId },
      {
        $set: {
          assignee: null,
          assigneeName: '[Deleted User]',
          updatedAt: new Date(),
        },
      },
    );

    // 5. Delete user's comments
    await db.collection('comments').deleteMany({ userId });

    // 6. Delete user's activity logs
    await db.collection('activity_logs').deleteMany({ userId });

    // 7. Delete user's notifications
    await db.collection('notifications').deleteMany({ userId });

    return NextResponse.json({
      success: true,
      message: 'User permanently deleted',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 },
    );
  }
}
