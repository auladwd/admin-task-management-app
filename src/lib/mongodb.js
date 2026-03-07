import { MongoClient } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env.local');
}

const uri = process.env.MONGODB_URI;
const options = {};

let client;
let clientPromise;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable to preserve the client across hot reloads
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, create a new client
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;

/**
 * Get database instance
 * @returns {Promise<Db>} MongoDB database instance
 */
export async function getDatabase() {
  const client = await clientPromise;
  return client.db(process.env.MONGODB_DB || 'task_management');
}

/**
 * Initialize database collections and indexes
 * Call this function once during app initialization
 */
export async function initializeDatabase() {
  try {
    const db = await getDatabase();

    // Create collections if they don't exist
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(col => col.name);

    // Users collection
    if (!collectionNames.includes('users')) {
      await db.createCollection('users');
    }

    // Tasks collection
    if (!collectionNames.includes('tasks')) {
      await db.createCollection('tasks');
    }

    // Comments collection
    if (!collectionNames.includes('comments')) {
      await db.createCollection('comments');
    }

    // Activity logs collection
    if (!collectionNames.includes('activity_logs')) {
      await db.createCollection('activity_logs');
    }

    // Create indexes for better performance
    await createIndexes(db);

    console.log('✅ Database initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  }
}

/**
 * Create database indexes
 */
async function createIndexes(db) {
  // Users indexes
  await db.collection('users').createIndex({ uid: 1 }, { unique: true });
  await db.collection('users').createIndex({ email: 1 }, { unique: true });
  await db.collection('users').createIndex({ role: 1 });
  await db.collection('users').createIndex({ isActive: 1 });

  // Tasks indexes
  await db.collection('tasks').createIndex({ assignee: 1 });
  await db.collection('tasks').createIndex({ createdBy: 1 });
  await db.collection('tasks').createIndex({ status: 1 });
  await db.collection('tasks').createIndex({ priority: 1 });
  await db.collection('tasks').createIndex({ dueDate: 1 });
  await db.collection('tasks').createIndex({ createdAt: -1 });

  // Compound index for common queries
  await db.collection('tasks').createIndex({ assignee: 1, status: 1 });
  await db.collection('tasks').createIndex({ status: 1, priority: 1 });

  // Comments indexes
  await db.collection('comments').createIndex({ taskId: 1 });
  await db.collection('comments').createIndex({ userId: 1 });
  await db.collection('comments').createIndex({ createdAt: -1 });

  // Activity logs indexes
  await db.collection('activity_logs').createIndex({ userId: 1 });
  await db.collection('activity_logs').createIndex({ taskId: 1 });
  await db.collection('activity_logs').createIndex({ actionType: 1 });
  await db.collection('activity_logs').createIndex({ createdAt: -1 });

  // Compound index for activity queries
  await db
    .collection('activity_logs')
    .createIndex({ taskId: 1, createdAt: -1 });

  console.log('✅ Database indexes created successfully');
}
