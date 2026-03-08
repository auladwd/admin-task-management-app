import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

/**
 * Statistics Card Component
 * Displays a metric with icon and trend
 * Mobile-first responsive design
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
    <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow duration-200 active:scale-[0.98]">
      <div className="card-body p-4 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm text-base-content/70 mb-1 truncate">
              {title}
            </p>
            {loading ? (
              <div className="skeleton h-8 sm:h-10 w-16 sm:w-20"></div>
            ) : (
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold truncate">
                {value}
              </h3>
            )}
            <p className="text-xs text-base-content/60 mt-1 sm:mt-2 line-clamp-2">
              {description}
            </p>
          </div>

          {Icon && (
            <div className={`${color} rounded-lg p-2 sm:p-3 flex-shrink-0`}>
              <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
          )}
        </div>

        {trend && (
          <div className="flex items-center gap-1 mt-2">
            {trend > 0 ? (
              <>
                <FiTrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-success" />
                <span className="text-xs text-success">+{trend}%</span>
              </>
            ) : trend < 0 ? (
              <>
                <FiTrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-error" />
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
