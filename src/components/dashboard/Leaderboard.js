'use client';

/**
 * Performance Leaderboard Component
 * Shows top performing staff members
 * Mobile-first responsive design
 */
export default function Leaderboard({ data, loading = false }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="skeleton h-20 sm:h-16 w-full"></div>
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-6 sm:py-8 px-4">
        <p className="text-base-content/70 text-sm sm:text-base">
          No performance data available
        </p>
        <p className="text-xs sm:text-sm text-base-content/50 mt-2">
          Complete tasks to appear on the leaderboard
        </p>
      </div>
    );
  }

  const getRankIcon = rank => {
    switch (rank) {
      case 1:
        return (
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-warning flex items-center justify-center">
            <span className="text-xl sm:text-2xl">🏆</span>
          </div>
        );
      case 2:
        return (
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-base-300 flex items-center justify-center">
            <span className="text-xl sm:text-2xl">🥈</span>
          </div>
        );
      case 3:
        return (
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-accent flex items-center justify-center">
            <span className="text-xl sm:text-2xl">🥉</span>
          </div>
        );
      default:
        return (
          <span className="text-base sm:text-lg font-bold text-base-content/70">
            #{rank}
          </span>
        );
    }
  };

  const getScoreColor = score => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-info';
    if (score >= 40) return 'text-warning';
    return 'text-error';
  };

  return (
    <div className="space-y-2 sm:space-y-3">
      {data.slice(0, 10).map(item => (
        <div
          key={item.userId}
          className={`
            flex items-center gap-2 sm:gap-4 p-3 sm:p-4 rounded-lg
            ${item.rank <= 3 ? 'bg-base-200' : 'bg-base-100'}
            hover:bg-base-200 transition-colors active:scale-[0.98]
          `}
        >
          {/* Rank */}
          <div className="flex-shrink-0 w-10 sm:w-12 flex justify-center">
            {getRankIcon(item.rank)}
          </div>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate text-sm sm:text-base">
              {item.name}
            </p>
            <p className="text-xs sm:text-sm text-base-content/70 truncate">
              {item.email}
            </p>
            {/* Mobile: Show stats inline */}
            <div className="flex gap-3 mt-1 text-xs sm:hidden">
              <span className="text-base-content/70">
                {item.completed}/{item.assigned} tasks
              </span>
              <span className="text-base-content/70">
                {item.completedOnTime} on time
              </span>
            </div>
          </div>

          {/* Stats - Hidden on mobile, shown on tablet+ */}
          <div className="hidden sm:flex gap-3 md:gap-4 text-xs sm:text-sm">
            <div className="text-center">
              <p className="text-base-content/70">Tasks</p>
              <p className="font-semibold">
                {item.completed}/{item.assigned}
              </p>
            </div>
            <div className="text-center">
              <p className="text-base-content/70">On Time</p>
              <p className="font-semibold">{item.completedOnTime}</p>
            </div>
          </div>

          {/* Score */}
          <div className="flex-shrink-0">
            <div className="text-center">
              <p
                className={`text-xl sm:text-2xl font-bold ${getScoreColor(item.score)}`}
              >
                {item.score.toFixed(0)}
              </p>
              <p className="text-xs text-base-content/70">Score</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
