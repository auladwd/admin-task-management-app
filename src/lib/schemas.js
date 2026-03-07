/**
 * Database Schema Definitions
 * These are documentation schemas - MongoDB is schemaless
 * Use these as reference for data structure
 */

/**
 * Users Collection Schema
 * Collection: users
 */
export const UserSchema = {
  _id: 'ObjectId', // MongoDB auto-generated ID
  uid: 'string', // Firebase UID (unique)
  email: 'string', // User email (unique)
  name: 'string', // Full name
  role: 'string', // 'super_admin' | 'team_leader' | 'staff'
  isActive: 'boolean', // Account status
  createdAt: 'Date', // Account creation date
  updatedAt: 'Date', // Last update date
};

/**
 * Example User Document:
 * {
 *   _id: ObjectId("507f1f77bcf86cd799439011"),
 *   uid: "firebase_uid_123",
 *   email: "john.doe@example.com",
 *   name: "John Doe",
 *   role: "staff",
 *   isActive: true,
 *   createdAt: ISODate("2024-01-15T10:30:00Z"),
 *   updatedAt: ISODate("2024-01-15T10:30:00Z")
 * }
 */

/**
 * Tasks Collection Schema
 * Collection: tasks
 */
export const TaskSchema = {
  _id: 'ObjectId', // MongoDB auto-generated ID
  title: 'string', // Task title
  description: 'string', // Task description
  assignee: 'string', // User UID of assigned staff
  assigneeName: 'string', // Name of assigned staff (denormalized)
  createdBy: 'string', // User UID of creator
  createdByName: 'string', // Name of creator (denormalized)
  dueDate: 'Date', // Task due date
  priority: 'string', // 'high' | 'medium' | 'low'
  status: 'string', // 'pending' | 'in_progress' | 'completed'
  attachments: 'Array', // Array of attachment links
  completedAt: 'Date', // Completion timestamp (null if not completed)
  createdAt: 'Date', // Task creation date
  updatedAt: 'Date', // Last update date
};

/**
 * Example Task Document:
 * {
 *   _id: ObjectId("507f1f77bcf86cd799439012"),
 *   title: "Prepare Monthly Report",
 *   description: "Compile and analyze data for monthly performance report",
 *   assignee: "firebase_uid_456",
 *   assigneeName: "Jane Smith",
 *   createdBy: "firebase_uid_123",
 *   createdByName: "John Doe",
 *   dueDate: ISODate("2024-02-01T23:59:59Z"),
 *   priority: "high",
 *   status: "in_progress",
 *   attachments: [
 *     { name: "Data Sheet", url: "https://example.com/file1.xlsx" },
 *     { name: "Template", url: "https://example.com/template.docx" }
 *   ],
 *   completedAt: null,
 *   createdAt: ISODate("2024-01-15T10:30:00Z"),
 *   updatedAt: ISODate("2024-01-20T14:45:00Z")
 * }
 */

/**
 * Comments Collection Schema
 * Collection: comments
 */
export const CommentSchema = {
  _id: 'ObjectId', // MongoDB auto-generated ID
  taskId: 'ObjectId', // Reference to task
  userId: 'string', // User UID who commented
  userName: 'string', // Name of commenter (denormalized)
  comment: 'string', // Comment text
  createdAt: 'Date', // Comment creation date
};

/**
 * Example Comment Document:
 * {
 *   _id: ObjectId("507f1f77bcf86cd799439013"),
 *   taskId: ObjectId("507f1f77bcf86cd799439012"),
 *   userId: "firebase_uid_456",
 *   userName: "Jane Smith",
 *   comment: "I've completed the data analysis section",
 *   createdAt: ISODate("2024-01-20T14:45:00Z")
 * }
 */

/**
 * Activity Logs Collection Schema
 * Collection: activity_logs
 */
export const ActivityLogSchema = {
  _id: 'ObjectId', // MongoDB auto-generated ID
  userId: 'string', // User UID who performed action
  userName: 'string', // Name of user (denormalized)
  actionType: 'string', // 'task_created' | 'task_updated' | 'task_assigned' | 'status_changed' | 'comment_added' | 'task_completed'
  taskId: 'ObjectId', // Reference to task (if applicable)
  taskTitle: 'string', // Task title (denormalized)
  description: 'string', // Human-readable description of action
  metadata: 'Object', // Additional data (e.g., old/new values)
  createdAt: 'Date', // Action timestamp
};

/**
 * Example Activity Log Document:
 * {
 *   _id: ObjectId("507f1f77bcf86cd799439014"),
 *   userId: "firebase_uid_123",
 *   userName: "John Doe",
 *   actionType: "task_created",
 *   taskId: ObjectId("507f1f77bcf86cd799439012"),
 *   taskTitle: "Prepare Monthly Report",
 *   description: "John Doe created task 'Prepare Monthly Report'",
 *   metadata: {
 *     assignee: "Jane Smith",
 *     priority: "high",
 *     dueDate: "2024-02-01"
 *   },
 *   createdAt: ISODate("2024-01-15T10:30:00Z")
 * }
 */

/**
 * Database Indexes
 *
 * Users Collection:
 * - { uid: 1 } - unique
 * - { email: 1 } - unique
 * - { role: 1 }
 * - { isActive: 1 }
 *
 * Tasks Collection:
 * - { assignee: 1 }
 * - { createdBy: 1 }
 * - { status: 1 }
 * - { priority: 1 }
 * - { dueDate: 1 }
 * - { createdAt: -1 }
 * - { assignee: 1, status: 1 } - compound
 * - { status: 1, priority: 1 } - compound
 *
 * Comments Collection:
 * - { taskId: 1 }
 * - { userId: 1 }
 * - { createdAt: -1 }
 *
 * Activity Logs Collection:
 * - { userId: 1 }
 * - { taskId: 1 }
 * - { actionType: 1 }
 * - { createdAt: -1 }
 * - { taskId: 1, createdAt: -1 } - compound
 */

/**
 * Helper function to validate user role
 */
export function isValidRole(role) {
  const validRoles = ['super_admin', 'team_leader', 'staff'];
  return validRoles.includes(role);
}

/**
 * Helper function to validate task status
 */
export function isValidStatus(status) {
  const validStatuses = ['pending', 'in_progress', 'completed'];
  return validStatuses.includes(status);
}

/**
 * Helper function to validate task priority
 */
export function isValidPriority(priority) {
  const validPriorities = ['high', 'medium', 'low'];
  return validPriorities.includes(priority);
}

/**
 * Helper function to validate activity action type
 */
export function isValidActionType(actionType) {
  const validActionTypes = [
    'task_created',
    'task_updated',
    'task_assigned',
    'status_changed',
    'comment_added',
    'task_completed',
  ];
  return validActionTypes.includes(actionType);
}
