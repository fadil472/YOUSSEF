import React, { useState, useEffect } from 'react';
import { RecurringTask } from './types';
import { STARTER_TASKS, formatDate } from './data/starterData';
import { MobileFrame } from './components/MobileFrame';
import { MobileBottomNav, MobileTab } from './components/MobileBottomNav';
import { TodayTasksView } from './components/TodayTasksView';
import { StatsDashboardView } from './components/StatsDashboardView';
import { CalendarLogView } from './components/CalendarLogView';
import { PlanView } from './components/PlanView';
import { AddTaskModal } from './components/AddTaskModal';
import { BackupModal } from './components/BackupModal';
import { InstallModal } from './components/InstallModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { Database, Smartphone } from 'lucide-react';

const STORAGE_TASKS_KEY = 'obsidian_vortex_tasks_v2';

export default function App() {
  const [tasks, setTasks] = useState<RecurringTask[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_TASKS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return STARTER_TASKS;
  });

  const [activeTab, setActiveTab] = useState<MobileTab>('today');
  const [isAddTaskOpen, setIsAddTaskOpen] = useState<boolean>(false);
  const [isBackupOpen, setIsBackupOpen] = useState<boolean>(false);
  const [isInstallOpen, setIsInstallOpen] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_TASKS_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.error(e);
    }
  }, [tasks]);

  const todayStr = formatDate(new Date());

  const handleToggleTaskToday = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const currentStatus = !!t.history[todayStr]?.completed;
        const nextStatus = !currentStatus;
        return {
          ...t,
          currentCountToday: nextStatus ? t.targetCount : 0,
          history: {
            ...t.history,
            [todayStr]: { completed: nextStatus, count: nextStatus ? t.targetCount : 0 },
          },
        };
      })
    );
  };

  const handleResetTaskToZero = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          currentCountToday: 0,
          history: { ...t.history, [todayStr]: { completed: false, count: 0 } },
        };
      })
    );
  };

  const handleDeleteTask = (taskId: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه المهمة نهائياً؟ لا يمكن التراجع عن هذا الإجراء.')) {
      return;
    }
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const handleIncrementTaskToday = (taskId: string, delta: number) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const current = t.history[todayStr]?.count ?? 0;
        const step = t.step || 1;
        const next = Math.max(0, Math.min(t.targetCount, current + delta));
        const completed = next >= t.targetCount;
        return {
          ...t,
          currentCountToday: next,
          history: { ...t.history, [todayStr]: { completed, count: next } },
        };
      })
    );
  };

  const handleToggleTaskForDate = (taskId: string, dateStr: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const current = !!t.history[dateStr]?.completed;
        return {
          ...t,
          history: {
            ...t.history,
            [dateStr]: { completed: !current, count: !current ? t.targetCount : 0 },
          },
        };
      })
    );
  };

  const handleAddTask = (newTask: RecurringTask) => {
    setTasks([newTask, ...tasks]);
  };

  const handleImportData = (data: { tasks: RecurringTask[] }, mode: 'replace' | 'merge') => {
    if (mode === 'replace') {
      if (data.tasks && data.tasks.length > 0) setTasks(data.tasks);
    } else {
      setTasks((prev) => {
        const mergedMap = new Map<string, RecurringTask>();
        prev.forEach((t) => mergedMap.set(t.id, { ...t }));
        data.tasks.forEach((incoming) => {
          const existingKey = Array.from(mergedMap.keys()).find(
            (k) => k === incoming.id || mergedMap.get(k)?.title === incoming.title
          );
          if (existingKey) {
            const existing = mergedMap.get(existingKey)!;
            mergedMap.set(existingKey, { ...existing, ...incoming, history: { ...existing.history, ...incoming.history } });
          } else {
            mergedMap.set(incoming.id, incoming);
          }
        });
        return Array.from(mergedMap.values());
      });
    }
  };

  const handleResetToDefaults = () => setTasks(STARTER_TASKS);

  const pendingToday = tasks.filter((t) => !t.history[todayStr]?.completed).length;

  return (
    <MobileFrame>
      <header className="h-11 px-4 border-b border-zinc-800/80 bg-[#121422]/90 backdrop-blur-md flex items-center justify-between z-20 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center text-white text-xs shadow-md shadow-violet-600/20">
            🌀
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-zinc-100 tracking-wide">دوامة أوبسيديان</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-violet-500/10 text-violet-300 font-mono border border-violet-500/20">Vortex</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={() => setIsInstallOpen(true)} className="flex items-center gap-1 text-[11px] font-semibold text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/80 px-2.5 py-1 rounded-xl border border-emerald-500/40 transition-all shadow-sm active:scale-95" title="تثبيت التطبيق">
            <Smartphone size={13} className="text-emerald-400" />
            <span>تثبيت APK</span>
          </button>
          <button onClick={() => setIsBackupOpen(true)} className="flex items-center gap-1 text-[11px] font-medium text-zinc-300 bg-zinc-800/90 hover:bg-zinc-700/90 px-2.5 py-1 rounded-xl border border-zinc-700/60 transition-all shadow-sm active:scale-95" title="نسخ احتياطي">
            <Database size={13} className="text-cyan-400" />
            <span>نسخ JSON</span>
          </button>
        </div>
      </header>

      {activeTab === 'today' && (
        <TodayTasksView
          tasks={tasks}
          onToggleTaskToday={handleToggleTaskToday}
          onResetTaskToZero={handleResetTaskToZero}
          onIncrementTaskToday={handleIncrementTaskToday}
          onDeleteTask={handleDeleteTask}
          onOpenAddTask={() => setIsAddTaskOpen(true)}
          onSelectNote={() => {}}
          notes={[]}
          onOpenBackup={() => setIsBackupOpen(true)}
          onOpenInstall={() => setIsInstallOpen(true)}
        />
      )}

      {activeTab === 'stats' && <StatsDashboardView tasks={tasks} onOpenBackup={() => setIsBackupOpen(true)} onOpenInstall={() => setIsInstallOpen(true)} />}
      {activeTab === 'calendar' && <CalendarLogView tasks={tasks} onToggleTaskForDate={handleToggleTaskForDate} />}
      {activeTab === 'plan' && <PlanView onOpenAddTask={() => setIsAddTaskOpen(true)} />}

      <MobileBottomNav activeTab={activeTab} onChangeTab={setActiveTab} pendingCount={pendingToday} />

      <AddTaskModal isOpen={isAddTaskOpen} onClose={() => setIsAddTaskOpen(false)} onAddTask={handleAddTask} notes={[]} />
      <BackupModal isOpen={isBackupOpen} onClose={() => setIsBackupOpen(false)} tasks={tasks} notes={[]} onImportData={handleImportData} onResetToDefaults={handleResetToDefaults} />
      <InstallModal isOpen={isInstallOpen} onClose={() => setIsInstallOpen(false)} />
      <OfflineIndicator />
    </MobileFrame>
  );
}
