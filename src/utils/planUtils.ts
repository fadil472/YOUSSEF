import { RecurringTask, Note } from '../types';

export interface StudyPlanItem {
  id: string;
  title: string;
  subject: string;
  duration: number; // بالدقائق
  priority: 'عالية' | 'متوسطة' | 'منخفضة';
  completedToday: boolean;
}

export interface WeeklyPlan {
  studySession: {
    enabled: boolean;
    duration: number; // 90 دقيقة افتراضياً
    startTime?: string; // مثال: "16:00"
  };
  customSessions: StudyPlanItem[];
}

const STORAGE_KEY = 'obsidian_vortex_plan_v1';

export function loadPlan(): WeeklyPlan {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('فشل تحميل الخطة', e);
  }
  
  // القيمة الافتراضية: جلسة دراسة واحدة 90 دقيقة
  return {
    studySession: {
      enabled: true,
      duration: 90,
    },
    customSessions: [],
  };
}

export function savePlan(plan: WeeklyPlan): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
}

export function toggleStudySessionCompletion(): void {
  const plan = loadPlan();
  // نستخدم localStorage مؤقتاً لتتبع إكمال الجلسة اليومية
  const todayStr = new Date().toISOString().split('T')[0];
  const key = `plan_session_${todayStr}`;
  const current = localStorage.getItem(key) === 'true';
  localStorage.setItem(key, String(!current));
}

export function isStudySessionCompletedToday(): boolean {
  const todayStr = new Date().toISOString().split('T')[0];
  const key = `plan_session_${todayStr}`;
  return localStorage.getItem(key) === 'true';
}

export function addCustomSession(session: Omit<StudyPlanItem, 'id' | 'completedToday'>): StudyPlanItem {
  const plan = loadPlan();
  const newSession: StudyPlanItem = {
    ...session,
    id: `session-${Date.now()}`,
    completedToday: false,
  };
  plan.customSessions.push(newSession);
  savePlan(plan);
  return newSession;
}

export function removeCustomSession(sessionId: string): void {
  const plan = loadPlan();
  plan.customSessions = plan.customSessions.filter((s) => s.id !== sessionId);
  savePlan(plan);
}

export function updateCustomSession(sessionId: string, updates: Partial<StudyPlanItem>): void {
  const plan = loadPlan();
  const idx = plan.customSessions.findIndex((s) => s.id === sessionId);
  if (idx !== -1) {
    plan.customSessions[idx] = { ...plan.customSessions[idx], ...updates };
    savePlan(plan);
  }
}

export function getTodayPlanStats(): { totalMinutes: number; completedMinutes: number; sessionsCount: number; completedSessions: number } {
  const plan = loadPlan();
  const sessionCompleted = isStudySessionCompletedToday();
  
  let totalMinutes = 0;
  let completedMinutes = 0;
  let sessionsCount = 0;
  let completedSessions = 0;

  if (plan.studySession.enabled) {
    totalMinutes += plan.studySession.duration;
    if (sessionCompleted) {
      completedMinutes += plan.studySession.duration;
      completedSessions += 1;
    }
    sessionsCount += 1;
  }

  plan.customSessions.forEach((s) => {
    totalMinutes += s.duration;
    sessionsCount += 1;
    if (s.completedToday) {
      completedMinutes += s.duration;
      completedSessions += 1;
    }
  });

  return { totalMinutes, completedMinutes, sessionsCount, completedSessions };
}
