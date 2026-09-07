'use client';

import { formatDateTime } from '@/utils/helpers';
import {
  FiCheckCircle,
  FiEdit,
  FiUserPlus,
  FiMessageSquare,
  FiClock,
  FiActivity,
} from 'react-icons/fi';

/**
 * Activity Feed Component
 * Displays real-time task updates and user interactions
 */
export default function ActivityFeed({ data, loading = false }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="skeleton h-16 w-full rounded-xl"></div>
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 px-4">
        <div className="w-12 h-12 rounded-full bg-base-200 flex items-center justify-center mx-auto mb-2 text-base-content/40">
          <FiActivity className="w-6 h-6" />
        </div>
        <p className="text-base-content/70 font-medium text-sm">
          No recent activity
        </p>
        <p className="text-xs text-base-content/40 mt-1">
          Activity will appear here as tasks are updated
        </p>
      </div>
    );
  }

  const getActivityConfig = actionType => {
    switch (actionType) {
      case 'task_created':
        return {
          icon: FiUserPlus,
          cls: 'bg-primary/10 text-primary border-primary/20',
        };
      case 'task_completed':
        return {
          icon: FiCheckCircle,
          cls: 'bg-success/10 text-success border-success/20',
        };
      case 'task_updated':
      case 'status_changed':
        return {
          icon: FiEdit,
          cls: 'bg-info/10 text-info border-info/20',
        };
      case 'comment_added':
        return {
          icon: FiMessageSquare,
          cls: 'bg-warning/10 text-warning border-warning/20',
        };
      default:
        return {
          icon: FiClock,
          cls: 'bg-base-200 text-base-content/60 border-base-300',
        };
    }
  };

  return (
    <div className="space-y-2.5">
      {data.map(activity => {
        const { icon: Icon, cls } = getActivityConfig(activity.actionType);

        return (
          <div
            key={activity._id}
            className="flex items-start gap-3 p-3 rounded-xl bg-base-100 border border-base-300/60 hover:bg-base-200/50 transition-colors"
          >
            {/* Icon */}
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border mt-0.5 ${cls}`}
            >
              <Icon className="w-4 h-4" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-base-content">
                <span className="font-bold text-base-content">
                  {activity.userName}
                </span>{' '}
                <span className="text-base-content/70">
                  {activity.description}
                </span>
              </p>
              {activity.taskTitle && (
                <p className="text-xs font-semibold text-primary mt-0.5 truncate">
                  {activity.taskTitle}
                </p>
              )}
              <p className="text-[10px] text-base-content/40 mt-1 font-medium">
                {formatDateTime(activity.createdAt)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
