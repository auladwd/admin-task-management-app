import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

/**
 * Statistics Card Component
 * Displays a metric with icon and trend
 */
export default function StatCard({
  title,
  value,
  description,
  icon: Icon,
  color = 'bg-primary',
  trend,
  loading = false,
}) {
  return (
    <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
      <div className="card-body">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-base-content/70 mb-1">{title}</p>
            {loading ? (
              <div className="skeleton h-10 w-20"></div>
            ) : (
              <h3 className="text-4xl font-bold">{value}</h3>
            )}
            <p className="text-xs text-base-content/60 mt-2">{description}</p>
          </div>

          {Icon && (
            <div className={`${color} rounded-lg p-3`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
          )}
        </div>

        {trend && (
          <div className="flex items-center gap-1 mt-2">
            {trend > 0 ? (
              <>
                <FiTrendingUp className="w-4 h-4 text-success" />
                <span className="text-xs text-success">+{trend}%</span>
              </>
            ) : trend < 0 ? (
              <>
                <FiTrendingDown className="w-4 h-4 text-error" />
                <span className="text-xs text-error">{trend}%</span>
              </>
            ) : null}
            <span className="text-xs text-base-content/60 ml-1">
              vs last week
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
