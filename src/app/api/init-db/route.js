import { NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/mongodb';

/**
 * GET /api/init-db
 * Initialize database collections and indexes
 * This should be called once during initial setup
 */
export async function GET() {
  try {
    await initializeDatabase();

    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully',
      collections: ['users', 'tasks', 'comments', 'activity_logs'],
      indexes: 'Created successfully',
    });
  } catch (error) {
    console.error('Database initialization error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to initialize database',
        details: error.message,
      },
      { status: 500 },
    );
  }
}
