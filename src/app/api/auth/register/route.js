import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

/**
 * POST /api/auth/register
 * Create user profile in MongoDB after Firebase registration
 */
export async function POST(request) {
  try {
    const { uid, email, name, role } = await request.json();

    // Validate required fields
    if (!uid || !email || !name || !role) {
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

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db();

    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ uid });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 },
      );
    }

    // Create user document
    const newUser = {
      uid,
      email,
      name,
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    };

    await db.collection('users').insertOne(newUser);

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
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
