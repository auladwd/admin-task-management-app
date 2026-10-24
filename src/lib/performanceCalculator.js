/**
 * Performance Calculator Utility
 * Centralized, rigorous evaluation engine for staff activities and leaderboard rankings.
 *
 * Scoring Formula (Total 100 Points):
 *   1. Task Volume & Output (45 pts max) → (completed / maxTeamCompleted) * 45
 *   2. Completion Rate (25 pts max)      → (completed / assigned) * 25
 *   3. On-Time Delivery (20 pts max)     → (completedOnTime / completed) * 20
 *   4. Discipline & Punctuality (10 pts) → 10 pts bonus minus penalty for overdue tasks
 *
 * Leaderboard Ranking:
 *   - Primary: Completed Tasks count (the person who completed more tasks ranks higher)
 *   - Tie-breakers: Score, Completion Rate, On-Time completions, Lower Overdue, Name
 *
 * If assigned === 0:
 *   Score = 0, Grade = 'No Tasks', GradeColor = 'neutral'
 */

/**
 * Returns the end-of-day cutoff for a given due date.
 */
function getEndOfDueDate(dueDate) {
  if (!dueDate) return null;
  const d = new Date(dueDate);
  if (isNaN(d.getTime())) return null;

  const utcEndOfDay = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 23, 59, 59, 999),
  );
  const localEndOfDay = new Date(
    d.getFullYear(),
    d.getMonth(),
    d.getDate(),
    23,
    59,
    59,
    999,
  );
  return new Date(Math.max(utcEndOfDay.getTime(), localEndOfDay.getTime()));
}

/**
 * Calculate comprehensive performance metrics for a single user.
 * @param {object} db - MongoDB database instance
 * @param {object} user - User document { uid, name, email, role, ... }
 * @param {Date} [referenceDate] - Optional reference date
 * @param {object} [context] - Optional context { maxTeamCompleted }
 */
export async function calculateUserPerformance(db, user, referenceDate = new Date(), context = {}) {
  const uid = user.uid;
  const now = referenceDate instanceof Date ? referenceDate : new Date(referenceDate);

  // Fetch all tasks assigned to this user
  const tasks = await db
    .collection('tasks')
    .find({ assignee: uid })
    .project({
      status: 1,
      dueDate: 1,
      completedAt: 1,
      priority: 1,
      title: 1,
      createdAt: 1,
    })
    .toArray();

  const assigned = tasks.length;
  const completed = tasks.filter(t => t.status === 'completed').length;
  const inProgress = tasks.filter(t => t.status === 'in_progress').length;
  const pending = tasks.filter(t => t.status === 'pending').length;

  let completedOnTime = 0;
  let completedEarly = 0;
  let completedLate = 0;

  tasks.forEach(t => {
    if (t.status === 'completed') {
      if (t.completedAt && t.dueDate) {
        const completedDate = new Date(t.completedAt);
        const deadline = getEndOfDueDate(t.dueDate);
        if (!isNaN(completedDate.getTime()) && deadline) {
          if (completedDate <= deadline) {
            completedOnTime++;
            if (deadline.getTime() - completedDate.getTime() >= 4 * 60 * 60 * 1000) {
              completedEarly++;
            }
          } else {
            completedLate++;
          }
        } else {
          completedLate++;
        }
      } else {
        completedLate++;
      }
    }
  });

  // Overdue tasks: Not completed AND past due date end-of-day
  const overdue = tasks.filter(t => {
    if (t.status === 'completed') return false;
    if (!t.dueDate) return false;
    const deadline = getEndOfDueDate(t.dueDate);
    return deadline && deadline < now;
  }).length;

  // Priority Breakdown
  const highAssigned = tasks.filter(t => t.priority === 'high').length;
  const highCompleted = tasks.filter(t => t.priority === 'high' && t.status === 'completed').length;
  const mediumAssigned = tasks.filter(t => t.priority === 'medium').length;
  const mediumCompleted = tasks.filter(t => t.priority === 'medium' && t.status === 'completed').length;
  const lowAssigned = tasks.filter(t => t.priority === 'low').length;
  const lowCompleted = tasks.filter(t => t.priority === 'low' && t.status === 'completed').length;

  // Percentage Rates
  const completionRate = assigned > 0 ? (completed / assigned) * 100 : 0;
  const onTimeRate = completed > 0 ? (completedOnTime / completed) * 100 : 0;
  const overdueRate = assigned > 0 ? (overdue / assigned) * 100 : 0;

  const totalPriorityAssignedWeight = (highAssigned * 3) + (mediumAssigned * 2) + (lowAssigned * 1);
  const totalPriorityCompletedWeight = (highCompleted * 3) + (mediumCompleted * 2) + (lowCompleted * 1);
  const priorityScoreRatio = totalPriorityAssignedWeight > 0
    ? totalPriorityCompletedWeight / totalPriorityAssignedWeight
    : 0;
  const priorityCompletionRate = priorityScoreRatio * 100;

  // Determine benchmark for team completed task volume
  let maxTeamCompleted = context?.maxTeamCompleted;
  if (typeof maxTeamCompleted !== 'number') {
    const topAgg = await db
      .collection('tasks')
      .aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: '$assignee', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 1 },
      ])
      .toArray();
    maxTeamCompleted = topAgg.length > 0 ? Math.max(topAgg[0].count, 1) : 1;
  }

  // 100-Point Score Calculation
  let score = 0;
  let grade = 'No Tasks';
  let gradeColor = 'neutral';
  const insights = [];

  if (assigned > 0) {
    // 1. Task Volume & Output (up to 45 pts)
    // Directly rewards actual delivery of work relative to team benchmark
    const volumePts = maxTeamCompleted > 0 ? (completed / maxTeamCompleted) * 45 : 0;

    // 2. Task Completion Rate (up to 25 pts)
    // Measures personal delivery percentage on assigned tasks
    const completionPts = (completionRate / 100) * 25;

    // 3. On-Time Delivery Rate (up to 20 pts)
    const onTimePts = (onTimeRate / 100) * 20;

    // 4. Discipline & Punctuality (up to 10 pts)
    // Penalize if overdue tasks exist
    const overduePenalty = (overdueRate / 100) * 15;
    const disciplinePts = Math.max(0, 10 - overduePenalty);

    // Sum and clamp to [0, 100]
    score = Math.round((volumePts + completionPts + onTimePts + disciplinePts) * 10) / 10;
    score = Math.max(0, Math.min(100, score));

    // Grade Determination:
    // Excellent requires both significant volume and high efficiency
    if (score >= 80) {
      grade = 'Excellent';
      gradeColor = 'success';
    } else if (score >= 65) {
      grade = 'Good';
      gradeColor = 'info';
    } else if (score >= 50) {
      grade = 'Average';
      gradeColor = 'warning';
    } else if (score >= 35) {
      grade = 'Below Average';
      gradeColor = 'warning';
    } else {
      grade = 'Needs Improvement';
      gradeColor = 'error';
    }

    // Smart Qualitative Insights
    if (completed >= 15) {
      insights.push({ type: 'success', text: 'Top Volume Producer', icon: '🏆' });
    } else if (completed >= 8) {
      insights.push({ type: 'info', text: 'High Task Contributor', icon: '⚡' });
    }
    if (completed === assigned && assigned > 2) {
      insights.push({ type: 'success', text: 'All Tasks Completed', icon: '✅' });
    }
    if (completedOnTime === completed && completed > 2) {
      insights.push({ type: 'success', text: '100% On-Time Record', icon: '🌟' });
    }
    if (overdue > 0) {
      insights.push({
        type: 'error',
        text: `${overdue} Overdue Task${overdue > 1 ? 's' : ''}`,
        icon: '⚠️',
      });
    }
    if (inProgress > 0) {
      insights.push({ type: 'info', text: 'Actively Working', icon: '🔄' });
    }
    if (completed === 1) {
      insights.push({ type: 'neutral', text: 'Initial Task Completed', icon: '📌' });
    }
  } else {
    insights.push({ type: 'neutral', text: 'No Tasks Assigned', icon: '📋' });
  }

  return {
    uid: user.uid,
    userId: user.uid,
    name: user.name || 'Unknown',
    email: user.email || '',
    role: user.role || 'staff',

    assigned,
    completed,
    completedOnTime,
    completedEarly,
    completedLate,
    inProgress,
    pending,
    overdue,

    highPriority: highAssigned,
    highPriorityCompleted: highCompleted,
    mediumPriority: mediumAssigned,
    mediumPriorityCompleted: mediumCompleted,
    lowPriority: lowAssigned,
    lowPriorityCompleted: lowCompleted,

    completionRate: Math.round(completionRate * 10) / 10,
    onTimeRate: Math.round(onTimeRate * 10) / 10,
    overdueRate: Math.round(overdueRate * 10) / 10,
    priorityCompletionRate: Math.round(priorityCompletionRate * 10) / 10,

    score,
    grade,
    gradeColor,
    insights,
  };
}

/**
 * Calculate sorted leaderboard for all active staff (or filtered users).
 * Sorts primarily by completed task volume (highest volume first),
 * followed by fair deterministic tie-breaking.
 *
 * @param {object} db - MongoDB database instance
 * @param {object} [options] - Options { roles: ['staff'], limit: 50, now: Date }
 */
export async function calculateLeaderboard(db, options = {}) {
  const {
    roles = ['staff'],
    limit = 50,
    now = new Date(),
  } = options;

  const query = { isActive: true };
  if (roles && roles.length > 0) {
    query.role = roles.length === 1 ? roles[0] : { $in: roles };
  }

  const users = await db.collection('users').find(query).toArray();

  // Find maximum completed tasks across the team for volume benchmark
  const topAgg = await db
    .collection('tasks')
    .aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: '$assignee', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ])
    .toArray();
  const maxTeamCompleted = topAgg.length > 0 ? Math.max(topAgg[0].count, 1) : 1;

  const performanceList = await Promise.all(
    users.map(user => calculateUserPerformance(db, user, now, { maxTeamCompleted })),
  );

  // Deterministic Leaderboard Ranking:
  // 1. Users with 0 assigned tasks go to the bottom
  // 2. Primary: Completed tasks count (যে বেশি কাজ সম্পন্ন করবে সে সবার উপরে)
  // 3. Secondary: Higher performance score
  // 4. Higher completion rate
  // 5. Higher on-time delivery count
  // 6. Fewer overdue tasks
  // 7. Alphabetical by name
  performanceList.sort((a, b) => {
    // Unassigned users at the bottom
    if (a.assigned === 0 && b.assigned > 0) return 1;
    if (b.assigned === 0 && a.assigned > 0) return -1;

    // 1. Primary: Most completed tasks
    if (b.completed !== a.completed) {
      return b.completed - a.completed;
    }

    // 2. Secondary: Higher score
    if (b.score !== a.score) {
      return b.score - a.score;
    }

    // 3. Higher completion rate
    if (b.completionRate !== a.completionRate) {
      return b.completionRate - a.completionRate;
    }

    // 4. More on-time completions
    if (b.completedOnTime !== a.completedOnTime) {
      return b.completedOnTime - a.completedOnTime;
    }

    // 5. Fewer overdue tasks
    if (a.overdue !== b.overdue) {
      return a.overdue - b.overdue;
    }

    // 6. Alphabetical
    return (a.name || '').localeCompare(b.name || '');
  });

  // Assign ranks (1, 2, 3...)
  performanceList.forEach((item, index) => {
    item.rank = index + 1;
  });

  return limit ? performanceList.slice(0, limit) : performanceList;
}
