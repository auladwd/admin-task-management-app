import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

/**
 * Modern Statistics Card Component
 * Displays a metric with rich gradient icon and trend pill
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
  // Mapping color to gradient & accent styles
  const colorMap = {
    'bg-primary': {
      gradient: 'from-indigo-600 to-primary',
      bgGlow: 'bg-primary/10 text-primary border-primary/20',
      borderAccent: 'hover:border-primary/40',
    },
    'bg-warning': {
      gradient: 'from-amber-500 to-orange-500',
      bgGlow: 'bg-warning/10 text-warning border-warning/20',
      borderAccent: 'hover:border-warning/40',
    },
    'bg-info': {
      gradient: 'from-cyan-500 to-sky-600',
      bgGlow: 'bg-info/10 text-info border-info/20',
      borderAccent: 'hover:border-info/40',
    },
    'bg-success': {
      gradient: 'from-emerald-500 to-teal-600',
      bgGlow: 'bg-success/10 text-success border-success/20',
      borderAccent: 'hover:border-success/40',
    },
  };

  const style = colorMap[color] || {
    gradient: 'from-primary to-accent',
    bgGlow: 'bg-primary/10 text-primary border-primary/20',
    borderAccent: 'hover:border-primary/40',
  };

  return (
    <div
      className={`
        card bg-base-100 border border-base-300/80 rounded-2xl shadow-soft
        hover:shadow-soft-md hover:-translate-y-0.5 active:scale-[0.99]
        transition-all duration-200 overflow-hidden relative group
        ${style.borderAccent}
      `}
    >
      <div className="card-body p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-base-content/60 truncate">
              {title}
            </p>
            {loading ? (
              <div className="skeleton h-9 w-20 mt-1 rounded-lg"></div>
            ) : (
              <h3 className="text-2xl sm:text-3xl font-extrabold text-base-content mt-1 tracking-tight truncate">
                {value}
              </h3>
            )}
            <p className="text-xs text-base-content/60 mt-1 line-clamp-1">
              {description}
            </p>
          </div>

          {Icon && (
            <div
              className={`
                w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center
                bg-gradient-to-tr ${style.gradient} text-white shadow-soft-sm flex-shrink-0
                group-hover:scale-105 transition-transform duration-200
              `}
            >
              <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          )}
        </div>

        {trend !== undefined && trend !== null && (
          <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-base-300/60">
            {trend > 0 ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-success/15 text-success">
                <FiTrendingUp className="w-3 h-3" />
                +{trend}%
              </span>
            ) : trend < 0 ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-error/15 text-error">
                <FiTrendingDown className="w-3 h-3" />
                {trend}%
              </span>
            ) : (
              <span className="text-[11px] font-medium text-base-content/50">
                0%
              </span>
            )}
            <span className="text-[11px] text-base-content/50">vs last week</span>
          </div>
        )}
      </div>
    </div>
  );
}
