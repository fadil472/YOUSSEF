import { RecurringTask, OverallStats, DayCommitment, TaskCommitmentStat } from '../types';
import { formatDate, getPastDates } from '../data/starterData';
import { ARABIC_DAYS, DEFAULT_COMMITMENT_THRESHOLD, DEFAULT_STREAK_THRESHOLD } from '../constants';

export { ARABIC_DAYS };

export function calculateOverallStats(tasks: RecurringTask[], daysRange = 30): OverallStats {
  const dates = getPastDates(daysRange);
  const todayStr = formatDate(new Date());

  if (tasks.length === 0) {
    return {
      totalLoggedDays: 0,
      totalCommittedDays: 0,
      totalMissedDays: 0,
      commitmentRate: 0,
      currentStreak: 0,
      longestStreak: 0,
      completedTodayCount: 0,
      totalTasksToday: 0,
      todayRate: 0,
    };
  }

  let totalCommittedUnits = 0;
  let totalMissedUnits = 0;

  // Day-level commitment (a day is considered committed if at least 70% of tasks were done)
  let committedDaysCount = 0;
  let missedDaysCount = 0;

  dates.forEach((date) => {
    // If today, only count tasks checked so far
    let dayCompleted = 0;
    tasks.forEach((t) => {
      const rec = t.history[date];
      if (rec?.completed) {
        dayCompleted += 1;
        totalCommittedUnits += 1;
      } else {
        totalMissedUnits += 1;
      }
    });

    const dayRate = dayCompleted / tasks.length;
    if (dayRate >= 0.6) {
      committedDaysCount += 1;
    } else {
      missedDaysCount += 1;
    }
  });

  const totalPossible = totalCommittedUnits + totalMissedUnits;
  const commitmentRate = totalPossible > 0 ? Math.round((totalCommittedUnits / totalPossible) * 100) : 0;

  // Calculate Streak
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  // Iterate backwards from yesterday/today
  const reversedDates = [...dates].reverse();
  for (const date of reversedDates) {
    let dayCompleted = 0;
    tasks.forEach((t) => {
      if (t.history[date]?.completed) dayCompleted += 1;
    });
    if (dayCompleted / tasks.length >= 0.5) {
      tempStreak += 1;
      if (tempStreak > longestStreak) longestStreak = tempStreak;
    } else {
      if (currentStreak === 0 && tempStreak > 0) {
        currentStreak = tempStreak;
      }
      tempStreak = 0;
    }
  }
  if (currentStreak === 0) currentStreak = tempStreak;

  // Today specific metrics
  const completedTodayCount = tasks.filter((t) => t.history[todayStr]?.completed).length;
  const todayRate = tasks.length > 0 ? Math.round((completedTodayCount / tasks.length) * 100) : 0;

  return {
    totalLoggedDays: dates.length,
    totalCommittedDays: committedDaysCount,
    totalMissedDays: missedDaysCount,
    commitmentRate,
    currentStreak,
    longestStreak: Math.max(longestStreak, currentStreak),
    completedTodayCount,
    totalTasksToday: tasks.length,
    todayRate,
  };
}

/**
 * Detailed day-by-day commitment records for timeline & heatmaps
 */
export function getDailyCommitmentHistory(tasks: RecurringTask[], daysRange = 30): DayCommitment[] {
  const dates = getPastDates(daysRange);
  const totalTasks = tasks.length;

  return dates.map((dateStr) => {
    const d = new Date(dateStr);
    const dayName = ARABIC_DAYS[d.getDay()];

    let committed = 0;
    let missed = 0;

    tasks.forEach((t) => {
      if (t.history[dateStr]?.completed) {
        committed += 1;
      } else {
        missed += 1;
      }
    });

    const rate = totalTasks > 0 ? Math.round((committed / totalTasks) * 100) : 0;
    let status: 'committed' | 'missed' | 'partial' | 'future' = 'missed';
    if (rate >= 75) status = 'committed';
    else if (rate >= 40) status = 'partial';
    else status = 'missed';

    return {
      date: dateStr,
      dayName,
      committed,
      missed,
      rate,
      status,
    };
  });
}

/**
 * Task-by-task statistics breakdown
 */
export function getTaskStats(tasks: RecurringTask[], daysRange = 30): TaskCommitmentStat[] {
  const dates = getPastDates(daysRange);

  return tasks.map((task) => {
    let committedDays = 0;
    let missedDays = 0;
    let streak = 0;
    let bestStreak = 0;
    let currentStreak = 0;

    dates.forEach((date) => {
      const isDone = !!task.history[date]?.completed;
      if (isDone) {
        committedDays += 1;
        streak += 1;
        if (streak > bestStreak) bestStreak = streak;
      } else {
        streak = 0;
      }
    });

    // reverse for current streak
    for (let i = dates.length - 1; i >= 0; i--) {
      if (task.history[dates[i]]?.completed) {
        currentStreak += 1;
      } else {
        break;
      }
    }

    const totalDays = committedDays + missedDays || dates.length;
    const rate = Math.round((committedDays / totalDays) * 100);

    return {
      task,
      committedDays,
      missedDays: dates.length - committedDays,
      rate,
      currentStreak,
      longestStreak: bestStreak,
    };
  });
}

/**
 * Weekday aggregation (السبت، الأحد، ...) to see which days have highest and lowest commitment
 */
export function getWeekdayStats(tasks: RecurringTask[], daysRange = 30) {
  const dates = getPastDates(daysRange);
  const weekdayTotals = Array(7).fill(0).map((_, i) => ({
    day: ARABIC_DAYS[i],
    committed: 0,
    missed: 0,
    count: 0,
  }));

  dates.forEach((dateStr) => {
    const d = new Date(dateStr);
    const dayIdx = d.getDay();
    const entry = weekdayTotals[dayIdx];
    entry.count += 1;

    tasks.forEach((t) => {
      if (t.history[dateStr]?.completed) {
        entry.committed += 1;
      } else {
        entry.missed += 1;
      }
    });
  });

  return weekdayTotals.map((w) => {
    const total = w.committed + w.missed;
    const rate = total > 0 ? Math.round((w.committed / total) * 100) : 0;
    return {
      name: w.day,
      rate,
      committed: w.committed,
      missed: w.missed,
    };
  });
}
