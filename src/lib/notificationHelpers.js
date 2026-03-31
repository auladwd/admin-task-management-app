import { getDatabase } from './mongodb';

/**
 * Create a notification for a specific user
 */
export async function createNotification({
  userId,
  title,
  message,
  type,
  taskId = null,
  taskTitle = null,
}) {
  const db = await getDatabase();

  const notification = {
    userId, // recipient's Firebase UID
    title,
    message,
    type, // 'task_assigned' | 'status_changed' | 'task_completed' | 'comment_added' | 'task_updated'
    taskId: taskId ? taskId.toString() : null,
    taskTitle: taskTitle || null,
    isRead: false,
    createdAt: new Date(),
  };

  await db.collection('notifications').insertOne(notification);
}

/**
 * Create notifications for multiple users at once
 */
export async function createNotifications(notifications) {
  if (!notifications || notifications.length === 0) return;
  const db = await getDatabase();
  const docs = notifications.map(n => ({
    userId: n.userId,
    title: n.title,
    message: n.message,
    type: n.type,
    taskId: n.taskId ? n.taskId.toString() : null,
    taskTitle: n.taskTitle || null,
    isRead: false,
    createdAt: new Date(),
  }));
  await db.collection('notifications').insertMany(docs);
}
