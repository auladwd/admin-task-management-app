import { ObjectId } from 'mongodb';
import { getDatabase } from './mongodb';

/**
 * Database Helper Functions
 * Reusable functions for common database operations
 */

/**
 * Check if string is valid MongoDB ObjectId
 */
export function isValidObjectId(id) {
  return ObjectId.isValid(id);
}

/**
 * Convert string to ObjectId
 */
export function toObjectId(id) {
  return new ObjectId(id);
}

/**
 * Get user by UID
 */
export async function getUserByUid(uid) {
  const db = await getDatabase();
  return await db.collection('users').findOne({ uid });
}

/**
 * Get user by email
 */
export async function getUserByEmail(email) {
  const db = await getDatabase();
  return await db.collection('users').findOne({ email });
}

/**
 * Get all active users
 */
export async function getActiveUsers() {
  const db = await getDatabase();
  return await db.collection('users').find({ isActive: true }).toArray();
}

/**
 * Get users by role
 */
export async function getUsersByRole(role) {
  const db = await getDatabase();
  return await db.collection('users').find({ role, isActive: true }).toArray();
}

/**
 * Create activity log
 */
export async function createActivityLog(logData) {
  const db = await getDatabase();

  const log = {
    userId: logData.userId,
    userName: logData.userName,
    actionType: logData.actionType,
    taskId: logData.taskId ? toObjectId(logData.taskId) : null,
    taskTitle: logData.taskTitle || null,
    description: logData.description,
    metadata: logData.metadata || {},
    createdAt: new Date(),
  };

  const result = await db.collection('activity_logs').insertOne(log);
  return result;
}

/**
 * Get recent activity logs
 */
export async function getRecentActivityLogs(limit = 10) {
  const db = await getDatabase();
  return await db
    .collection('activity_logs')
    .find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
}

/**
 * Get activity logs by task
 */
export async function getActivityLogsByTask(taskId) {
  const db = await getDatabase();
  return await db
    .collection('activity_logs')
    .find({ taskId: toObjectId(taskId) })
    .sort({ createdAt: -1 })
    .toArray();
}

/**
 * Get activity logs by user
 */
export async function getActivityLogsByUser(userId, limit = 20) {
  const db = await getDatabase();
  return await db
    .collection('activity_logs')
    .find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
}

/**
 * Get task by ID
 */
export async function getTaskById(taskId) {
  const db = await getDatabase();
  return await db.collection('tasks').findOne({ _id: toObjectId(taskId) });
}

/**
 * Get tasks by assignee
 */
export async function getTasksByAssignee(assigneeUid) {
  const db = await getDatabase();
  return await db
    .collection('tasks')
    .find({ assignee: assigneeUid })
    .sort({ createdAt: -1 })
    .toArray();
}

/**
 * Get tasks by status
 */
export async function getTasksByStatus(status) {
  const db = await getDatabase();
  return await db
    .collection('tasks')
    .find({ status })
    .sort({ createdAt: -1 })
    .toArray();
}

/**
 * Get overdue tasks
 */
export async function getOverdueTasks() {
  const db = await getDatabase();
  const now = new Date();

  return await db
    .collection('tasks')
    .find({
      status: { $ne: 'completed' },
      dueDate: { $lt: now },
    })
    .sort({ dueDate: 1 })
    .toArray();
}

/**
 * Get comments by task
 */
export async function getCommentsByTask(taskId) {
  const db = await getDatabase();
  return await db
    .collection('comments')
    .find({ taskId: toObjectId(taskId) })
    .sort({ createdAt: 1 })
    .toArray();
}

/**
 * Create comment
 */
export async function createComment(commentData) {
  const db = await getDatabase();

  const comment = {
    taskId: toObjectId(commentData.taskId),
    userId: commentData.userId,
    userName: commentData.userName,
    comment: commentData.comment,
    createdAt: new Date(),
  };

  const result = await db.collection('comments').insertOne(comment);
  return result;
}

/**
 * Get task statistics
 */
export async function getTaskStatistics() {
  const db = await getDatabase();

  const total = await db.collection('tasks').countDocuments();
  const pending = await db
    .collection('tasks')
    .countDocuments({ status: 'pending' });
  const inProgress = await db
    .collection('tasks')
    .countDocuments({ status: 'in_progress' });
  const completed = await db
    .collection('tasks')
    .countDocuments({ status: 'completed' });

  const now = new Date();
  const overdue = await db.collection('tasks').countDocuments({
    status: { $ne: 'completed' },
    dueDate: { $lt: now },
  });

  return {
    total,
    pending,
    inProgress,
    completed,
    overdue,
  };
}

/**
 * Get user performance statistics
 */
export async function getUserPerformance(userId) {
  const db = await getDatabase();
  const user = await db.collection('users').findOne({ uid: userId });
  if (!user) {
    return {
      assigned: 0,
      completed: 0,
      completedOnTime: 0,
      overdue: 0,
      completionRate: 0,
      onTimeRate: 0,
      score: 0,
    };
  }

  const { calculateUserPerformance } = await import('./performanceCalculator');
  return await calculateUserPerformance(db, user);
}
