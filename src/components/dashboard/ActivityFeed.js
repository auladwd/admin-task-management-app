'use client';

import { formatDateTime } from '@/utils/helpers';
import {
  FiCheckCircle,
  FiEdit,
  FiUserPlus,
  FiMessageSquare,
  FiClock,
} from 'react-icons/fi';

/**
 * Activity Feed Component
 * Shows recent activity logs
 */
export default function ActivityFeed({ data, loading = false }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="skeleton h-20 w-full"></div>
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-base-content/70">No recent activity</p>
        <p className="text-sm text-base-content/50 mt-2">
          Activity will appear here as tasks are created and updated
        </p>
      </div>
    );
  }

  const getActivityIcon = actionType => {
    switch (actionType) {
      case 'task_created':
        return <FiUserPlus className="w-5 h-5 text-primary" />;
      case 'task_completed':
        return <FiCheckCircle className="w-5 h-5 text-success" />;
      case 'task_updated':
      case 'status_changed':
        return <FiEdit className="w-5 h-5 text-info" />;
      case 'comment_added':
        return <FiMessageSquare className="w-5 h-5 text-warning" />;
      default:
        return <FiClock className="w-5 h-5 text-base-content/50" />;
    }
  };

  const getActivityColor = actionType => {
    switch (actionType) {
      case 'task_created':
        return 'bg-primary/10';
      case 'task_completed':
        return 'bg-success/10';
      case 'task_updated':
      case 'status_changed':
        return 'bg-info/10';
      case 'comment_added':
        return 'bg-warning/10';
      default:
        return 'bg-base-200';
    }
  };

  return (
    <div className="space-y-3">
      {data.map(activity => (
        <div
          key={activity._id}
          className="flex items-start gap-3 p-3 rounded-lg hover:bg-base-200 transition-colors"
        >
          {/* Icon */}
          <div
            className={`flex-shrink-0 p-2 rounded-lg ${getActivityColor(activity.actionType)}`}
          >
            {getActivityIcon(activity.actionType)}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm">
              <span className="font-semibold">{activity.userName}</span>{' '}
              <span className="text-base-content/70">
                {activity.description}
              </span>
            </p>
            {activity.taskTitle && (
              <p className="text-sm text-primary mt-1 truncate">
                {activity.taskTitle}
              </p>
            )}
            <p className="text-xs text-base-content/60 mt-1">
              {formatDateTime(activity.createdAt)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
