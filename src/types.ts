export type RecurrenceType = 'daily' | 'weekdays' | 'weekly' | 'custom';

export interface RecurringTask {
  id: string;
  title: string;
  description?: string;
  category: string;
  icon: string;
  color: string;
  recurrence: RecurrenceType;
  targetCount: number; // e.g. 1 for boolean, or 5 for glasses/pomodoros
  currentCountToday: number; // resets to 0 each cycle!
  linkedNoteTitle?: string;
  createdAt: string; // YYYY-MM-DD
  history: Record<string, { completed: boolean; count: number; note?: string }>; // date string 'YYYY-MM-DD' -> status
}

export interface ObsidianNote {
  id: string;
  title: string;
  content: string;
  tags: string[];
  updatedAt: number;
}

export interface OverallStats {
  totalLoggedDays: number;
  totalCommittedDays: number;
  totalMissedDays: number;
  commitmentRate: number; // percentage e.g. 82
  currentStreak: number;
  longestStreak: number;
  completedTodayCount: number;
  totalTasksToday: number;
  todayRate: number;
}

export interface DayCommitment {
  date: string; // YYYY-MM-DD
  dayName: string;
  committed: number;
  missed: number;
  rate: number; // percentage
  status: 'committed' | 'missed' | 'partial' | 'future';
}

export interface TaskCommitmentStat {
  task: RecurringTask;
  committedDays: number;
  missedDays: number;
  rate: number;
  currentStreak: number;
  longestStreak: number;
}

