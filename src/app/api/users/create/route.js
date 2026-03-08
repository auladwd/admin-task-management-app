import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebaseAdmin';
import clientPromise from '@/lib/mongodb';

/**
 * POST /api/users/create
 * Create a new user using Firebase Admin SDK (doesn't affect current session)
 */
export async function POST(request) {
  try {
    const { email, password, name, role } = await request.json();

    // Validate required fields
    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    // Validate role
    const validRoles = ['super_admin', 'team_leader', 'staff'];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 },
      );
    }

    // Create user in Firebase using Admin SDK
    let firebaseUser;
    try {
      firebaseUser = await adminAuth.createUser({
        email,
        password,
        displayName: name,
        emailVerified: false,
      });
    } catch (firebaseError) {
      console.error('Firebase user creation error:', firebaseError);

      // Handle specific Firebase errors
      if (firebaseError.code === 'auth/email-already-exists') {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 409 },
        );
      }

      return NextResponse.json(
        { error: 'Failed to create user in Firebase' },
        { status: 500 },
      );
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db();

    // Create user document in MongoDB
    const newUser = {
      uid: firebaseUser.uid,
      email,
      name,
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    };

    try {
      await db.collection('users').insertOne(newUser);
    } catch (dbError) {
      console.error('MongoDB user creation error:', dbError);

      // If MongoDB fails, delete the Firebase user to maintain consistency
      try {
        await adminAuth.deleteUser(firebaseUser.uid);
      } catch (deleteError) {
        console.error('Failed to rollback Firebase user:', deleteError);
      }

      return NextResponse.json(
        { error: 'Failed to create user profile' },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        message: 'User created successfully',
        user: {
          uid: newUser.uid,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('User creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
