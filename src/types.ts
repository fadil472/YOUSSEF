export type RecurrenceType = 'daily' | 'weekdays' | 'weekly' | 'custom';

export interface RecurringTask {
  id: string;
  title: string;
  description?: string;
  category: string;
  icon: string;
  color: string;
  recurrence: RecurrenceType;
  targetCount: number;
  currentCountToday: number;
  linkedNoteTitle?: string;
  createdAt: string;
  history: Record<string, { completed: boolean; count: number; note?: string }>;
}

export interface Folder {
  id: string;
  name: string;
  parentId?: string;
  icon?: string;
  color?: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  folder: string;
  tags: string[];
  pinned: boolean;
  createdAt: number;
  updatedAt: number;
  links?: string[]; // outbound wiki links [[...]]
  backlinks?: string[]; // inbound wiki links
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

