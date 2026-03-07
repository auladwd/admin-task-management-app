import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

/**
 * GET /api/test-db
 * Test MongoDB connection and list collections
 */
export async function GET() {
  try {
    const db = await getDatabase();

    // Test connection by listing collections
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(col => col.name);

    // Get document counts
    const counts = {};
    for (const name of collectionNames) {
      counts[name] = await db.collection(name).countDocuments();
    }

    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      database: db.databaseName,
      collections: collectionNames,
      documentCounts: counts,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to connect to database',
        details: error.message,
      },
      { status: 500 },
    );
  }
}
