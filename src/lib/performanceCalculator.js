/**
 * Performance Calculator Utility
 * Centralized, rigorous evaluation engine for staff activities and leaderboard rankings.
 *
 * Scoring Formula (Total 100 Points):
 *   1. Completion Rate (40 pts max)  → (completed / assigned) * 40
 *   2. On-Time Delivery (35 pts max) → (completedOnTime / completed) * 35
 *   3. Priority & Quality (15 pts max) → Weighted score of completed priority tasks vs assigned
 *      (High = 3x, Medium = 2x, Low = 1x)
 *   4. Discipline & Punctuality (10 pts max) → 10 pts if 0 overdue; deducted proportionally if overdue tasks exist
 *
 * If assigned === 0:
 *   Score = 0, Grade = 'No Tasks', GradeColor = 'neutral'
 */

/**
 * Returns the end-of-day cutoff for a given due date.
 * When a task due date is specified like '2026-09-18', the task is due
 * by the end of that calendar day. Timezone differences (e.g. UTC midnight being 06:00 AM local)
 * should not cause tasks completed on the same date to be flagged as late.
 */
function getEndOfDueDate(dueDate) {
  if (!dueDate) return null;
  const d = new Date(dueDate);
  if (isNaN(d.getTime())) return null;

  // Compute both UTC end-of-day and Local end-of-day, taking the latest cutoff
  // so the employee is given the full calendar day in both UTC and local timezone.
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
 * @param {Date} [referenceDate] - Optional reference date for testing (defaults to new Date())
 */
export async function calculateUserPerformance(db, user, referenceDate = new Date()) {
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

  // On-time completion verification:
  // Must be completed, must have a valid completedAt date, and completedAt <= endOfDueDate
  let completedOnTime = 0;
  let completedEarly = 0; // Completed at least 4 hours before deadline
  let completedLate = 0;

  tasks.forEach(t => {
    if (t.status === 'completed') {
      if (t.completedAt && t.dueDate) {
        const completedDate = new Date(t.completedAt);
        const deadline = getEndOfDueDate(t.dueDate);
        if (!isNaN(completedDate.getTime()) && deadline) {
          if (completedDate <= deadline) {
            completedOnTime++;
            // Check if completed more than 4 hours ahead of deadline
            if (deadline.getTime() - completedDate.getTime() >= 4 * 60 * 60 * 1000) {
              completedEarly++;
            }
          } else {
            completedLate++;
          }
        } else {
          // If dates are invalid, count as completed but not on time
          completedLate++;
        }
      } else {
        // Missing completion timestamp
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

  // Priority Breakdown (Assigned & Completed)
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

  // Weighted Priority Calculation (High = 3, Med = 2, Low = 1)
  const totalPriorityAssignedWeight = (highAssigned * 3) + (mediumAssigned * 2) + (lowAssigned * 1);
  const totalPriorityCompletedWeight = (highCompleted * 3) + (mediumCompleted * 2) + (lowCompleted * 1);

  const priorityScoreRatio = totalPriorityAssignedWeight > 0
    ? totalPriorityCompletedWeight / totalPriorityAssignedWeight
    : 0;
  const priorityCompletionRate = priorityScoreRatio * 100;

  // 100-Point Score Calculation
  let score = 0;
  let grade = 'No Tasks';
  let gradeColor = 'neutral';
  const insights = [];

  if (assigned > 0) {
    // 1. Completion Rate (up to 40 pts)
    const completionPts = (completionRate / 100) * 40;

    // 2. On-Time Delivery (up to 35 pts)
    const onTimePts = (onTimeRate / 100) * 35;

    // 3. Priority Execution (up to 15 pts)
    const priorityPts = priorityScoreRatio * 15;

    // 4. Punctuality & Discipline (up to 10 pts)
    // Full 10 pts if 0 overdue; penalize if overdue exists
    const overduePenalty = (overdueRate / 100) * 15;
    const disciplinePts = Math.max(0, 10 - overduePenalty);

    // Sum and clamp to [0, 100]
    score = Math.round((completionPts + onTimePts + priorityPts + disciplinePts) * 10) / 10;
    score = Math.max(0, Math.min(100, score));

    // Grade Determination
    if (score >= 90) {
      grade = 'Excellent';
      gradeColor = 'success';
    } else if (score >= 75) {
      grade = 'Good';
      gradeColor = 'info';
    } else if (score >= 60) {
      grade = 'Average';
      gradeColor = 'warning';
    } else if (score >= 40) {
      grade = 'Below Average';
      gradeColor = 'warning';
    } else {
      grade = 'Needs Improvement';
      gradeColor = 'error';
    }

    // Smart Qualitative Insights
    if (completed === assigned && assigned > 0) {
      insights.push({ type: 'success', text: 'All Tasks Completed', icon: '✅' });
    }
    if (completedOnTime === completed && completed > 0) {
      insights.push({ type: 'success', text: '100% On-Time Record', icon: '🌟' });
    }
    if (highCompleted === highAssigned && highAssigned > 0) {
      insights.push({ type: 'info', text: 'High Priority Completed', icon: '⚡' });
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
  } else {
    insights.push({ type: 'neutral', text: 'No Tasks Assigned', icon: '📋' });
  }

  return {
    // User info
    uid: user.uid,
    userId: user.uid, // Alias for leaderboard compatibility
    name: user.name || 'Unknown',
    email: user.email || '',
    role: user.role || 'staff',

    // Task counts
    assigned,
    completed,
    completedOnTime,
    completedEarly,
    completedLate,
    inProgress,
    pending,
    overdue,

    // Priority breakdown
    highPriority: highAssigned,
    highPriorityCompleted: highCompleted,
    mediumPriority: mediumAssigned,
    mediumPriorityCompleted: mediumCompleted,
    lowPriority: lowAssigned,
    lowPriorityCompleted: lowCompleted,

    // Rates (rounded to 1 decimal place)
    completionRate: Math.round(completionRate * 10) / 10,
    onTimeRate: Math.round(onTimeRate * 10) / 10,
    overdueRate: Math.round(overdueRate * 10) / 10,
    priorityCompletionRate: Math.round(priorityCompletionRate * 10) / 10,

    // Score & Grade
    score,
    grade,
    gradeColor,
    insights,
  };
}

/**
 * Calculate sorted leaderboard for all active staff (or filtered users).
 * Applies fair deterministic tie-breaking.
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

  const performanceList = await Promise.all(
    users.map(user => calculateUserPerformance(db, user, now)),
  );

  // Deterministic tie-breaking:
  // 1. Score (highest first)
  // 2. Completed tasks (higher volume)
  // 3. Completed on time (punctuality)
  // 4. High-priority completed
  // 5. Lower overdue count
  // 6. Name alphabetical
  performanceList.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.completed !== a.completed) return b.completed - a.completed;
    if (b.completedOnTime !== a.completedOnTime) return b.completedOnTime - a.completedOnTime;
    if (b.highPriorityCompleted !== a.highPriorityCompleted) return b.highPriorityCompleted - a.highPriorityCompleted;
    if (a.overdue !== b.overdue) return a.overdue - b.overdue;
    return (a.name || '').localeCompare(b.name || '');
  });

  // Assign ranks
  performanceList.forEach((item, index) => {
    item.rank = index + 1;
  });

  return limit ? performanceList.slice(0, limit) : performanceList;
}
