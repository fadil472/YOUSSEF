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

// Legacy types for compatibility
export interface Note {
  id: string;
  title: string;
  content: string;
  folder?: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
  color?: string;
  pinned?: boolean;
}

export interface Folder {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

export interface NodeLink {
  sourceId: string;
  targetId: string;
  isReciprocal?: boolean;
  source?: string;
  target?: string;
  label?: string;
}

export type VortexMode = 'galaxy' | 'gravity-well' | 'concentric';

export interface VortexSettings {
  rotationSpeed: number;
  zoom: number;
  pullForce: number;
  mode: VortexMode;
  showLabels: boolean;
  minLinksFilter: number;
}

export interface VaultStats {
  totalNotes: number;
  totalLinks: number;
  totalWords: number;
  readingTimeMinutes: number;
  avgWordsPerNote?: number;
  graphDensity?: number;
  density?: number;
  reciprocityRate: number;
  orphanNotesCount?: number;
  orphanCount?: number;
  topConnectedNotes?: { id: string; title: string; count: number }[];
  topConnected?: { note?: Note; id?: string; title?: string; count: number; folder?: string }[];
  orphans?: Note[];
  tagFrequency?: { tag: string; count: number }[];
  tagDistribution?: { tag: string; count: number }[];
  folderDistribution?: { folder?: string; folderName?: string; count: number; percentage?: number; color: string }[];
  vortexRings?: {
    core: number;
    innerOrbit: number;
    outerOrbit: number;
    periphery: number;
  };
  gravityRings?: {
    core: { count: number; label: string; notes: Note[] };
    inner: { count: number; label: string; notes: Note[] };
    outer: { count: number; label: string; notes: Note[] };
    periphery: { count: number; label: string; notes: Note[] };
  };
}

