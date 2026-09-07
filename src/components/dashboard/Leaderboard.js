'use client';

/**
 * Performance Leaderboard Component
 * Displays top performing staff members with podium highlights
 */
export default function Leaderboard({ data, loading = false }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="skeleton h-16 w-full rounded-xl"></div>
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 px-4">
        <div className="w-12 h-12 rounded-full bg-base-200 flex items-center justify-center mx-auto mb-2 text-2xl">
          🏆
        </div>
        <p className="text-base-content/70 font-medium text-sm">
          No performance data available
        </p>
        <p className="text-xs text-base-content/40 mt-1">
          Complete tasks to appear on the leaderboard
        </p>
      </div>
    );
  }

  const getRankBadge = rank => {
    switch (rank) {
      case 1:
        return (
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-yellow-950 font-black flex items-center justify-center text-base shadow-sm ring-2 ring-yellow-400/30">
            🥇
          </div>
        );
      case 2:
        return (
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-slate-300 to-slate-200 text-slate-800 font-black flex items-center justify-center text-base shadow-sm ring-2 ring-slate-300/30">
            🥈
          </div>
        );
      case 3:
        return (
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-amber-700 to-amber-500 text-white font-black flex items-center justify-center text-base shadow-sm ring-2 ring-amber-600/30">
            🥉
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-base-200 text-base-content/70 font-bold flex items-center justify-center text-xs">
            #{rank}
          </div>
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
    <div className="space-y-2.5">
      {data.slice(0, 10).map(item => (
        <div
          key={item.userId}
          className={`
            flex items-center gap-3 p-3 rounded-xl border transition-all duration-200
            ${
              item.rank === 1
                ? 'bg-amber-500/5 border-amber-500/20'
                : item.rank === 2
                  ? 'bg-slate-500/5 border-slate-500/20'
                  : item.rank === 3
                    ? 'bg-orange-500/5 border-orange-500/20'
                    : 'bg-base-100 border-base-300/60 hover:bg-base-200/50'
            }
          `}
        >
          {/* Rank Badge */}
          <div className="flex-shrink-0">{getRankBadge(item.rank)}</div>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-bold text-sm truncate text-base-content">
                {item.name}
              </p>
            </div>
            <p className="text-xs text-base-content/60 truncate">
              {item.email}
            </p>
            <div className="flex gap-2.5 mt-1 text-[11px] text-base-content/60 sm:hidden">
              <span>
                {item.completed}/{item.assigned} tasks
              </span>
              <span>·</span>
              <span>{item.completedOnTime} on time</span>
            </div>
          </div>

          {/* Stats - Tablet & Desktop */}
          <div className="hidden sm:flex items-center gap-4 text-xs">
            <div className="text-right">
              <p className="font-bold text-base-content">
                {item.completed}/{item.assigned}
              </p>
              <p className="text-[10px] text-base-content/50 uppercase">Tasks</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-success">{item.completedOnTime}</p>
              <p className="text-[10px] text-base-content/50 uppercase">On Time</p>
            </div>
          </div>

          {/* Score Pill */}
          <div className="flex-shrink-0 text-right min-w-[48px]">
            <p className={`text-lg sm:text-xl font-black ${getScoreColor(item.score)}`}>
              {item.score.toFixed(0)}
            </p>
            <p className="text-[10px] uppercase font-bold tracking-wider text-base-content/40">
              Score
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
