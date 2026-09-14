import React, { useState, useEffect } from 'react';
import { RecurringTask, ObsidianNote } from './types';
import { STARTER_TASKS, STARTER_NOTES, formatDate } from './data/starterData';
import { MobileFrame } from './components/layout/MobileFrame';
import { MobileBottomNav, MobileTab } from './components/layout/MobileBottomNav';
import { TodayTasksView } from './components/features/TodayTasksView';
import { StatsDashboardView } from './components/features/StatsDashboardView';
import { NotesView } from './components/features/NotesView';
import { CalendarLogView } from './components/features/CalendarLogView';
import { AddTaskModal } from './components/features/AddTaskModal';
import { BackupModal } from './components/features/BackupModal';
import { InstallModal } from './components/features/InstallModal';
import { OfflineIndicator } from './components/ui/OfflineIndicator';
import { Database, Smartphone } from 'lucide-react';
import { STORAGE_TASKS_KEY, STORAGE_NOTES_KEY } from './constants';

export default function App() {
  // Load tasks from storage or fallback
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

  // Load notes from storage or fallback
  const [notes, setNotes] = useState<ObsidianNote[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_NOTES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return STARTER_NOTES;
  });

  const [activeTab, setActiveTab] = useState<MobileTab>('today');
  const [selectedNoteTitle, setSelectedNoteTitle] = useState<string | null>(null);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState<boolean>(false);
  const [isBackupOpen, setIsBackupOpen] = useState<boolean>(false);
  const [isInstallOpen, setIsInstallOpen] = useState<boolean>(false);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_TASKS_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.error(e);
    }
  }, [tasks]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_NOTES_KEY, JSON.stringify(notes));
    } catch (e) {
      console.error(e);
    }
  }, [notes]);

  const todayStr = formatDate(new Date());

  // Toggle task for today
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
            [todayStr]: {
              completed: nextStatus,
              count: nextStatus ? t.targetCount : 0,
            },
          },
        };
      })
    );
  };

  // Manually reset task back to point zero
  const handleResetTaskToZero = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          currentCountToday: 0,
          history: {
            ...t.history,
            [todayStr]: {
              completed: false,
              count: 0,
            },
          },
        };
      })
    );
  };

  // Toggle task for any specific historical date
  const handleToggleTaskForDate = (taskId: string, dateStr: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const current = !!t.history[dateStr]?.completed;
        return {
          ...t,
          history: {
            ...t.history,
            [dateStr]: {
              completed: !current,
              count: !current ? t.targetCount : 0,
            },
          },
        };
      })
    );
  };

  // Add new recurring task
  const handleAddTask = (newTask: RecurringTask) => {
    setTasks([newTask, ...tasks]);
  };

  // Notes management
  const handleSelectNoteByTitle = (title: string | null) => {
    setSelectedNoteTitle(title);
    if (title) {
      setActiveTab('notes');
    }
  };

  const handleUpdateNote = (updated: ObsidianNote) => {
    setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
  };

  const handleCreateNote = (title: string) => {
    const newNote: ObsidianNote = {
      id: `note-${Date.now()}`,
      title,
      tags: ['ملاحظة_جديدة'],
      updatedAt: Date.now(),
      content: `# ${title}\n\nسجل تفاصيل وملاحظات هذه العادة أو المهمة هنا...\n\n- [ ] خطوة عملية\n`,
    };
    setNotes([newNote, ...notes]);
    setSelectedNoteTitle(title);
  };

  const handleDeleteNote = (noteId: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
  };

  // Import Backup Data (Replace or Smart Merge)
  const handleImportData = (
    data: { tasks: RecurringTask[]; notes: ObsidianNote[] },
    mode: 'replace' | 'merge'
  ) => {
    if (mode === 'replace') {
      if (data.tasks && data.tasks.length > 0) {
        setTasks(data.tasks);
      }
      if (data.notes && data.notes.length > 0) {
        setNotes(data.notes);
      }
    } else {
      // Smart Merge Mode
      setTasks((prev) => {
        const mergedMap = new Map<string, RecurringTask>();
        prev.forEach((t) => mergedMap.set(t.id, { ...t }));
        
        data.tasks.forEach((incoming) => {
          // Check if already exists by id or title
          const existingKey = Array.from(mergedMap.keys()).find(
            (k) => k === incoming.id || mergedMap.get(k)?.title === incoming.title
          );
          if (existingKey) {
            const existing = mergedMap.get(existingKey)!;
            mergedMap.set(existingKey, {
              ...existing,
              ...incoming,
              history: {
                ...existing.history,
                ...incoming.history,
              },
            });
          } else {
            mergedMap.set(incoming.id, incoming);
          }
        });
        return Array.from(mergedMap.values());
      });

      setNotes((prev) => {
        const mergedMap = new Map<string, ObsidianNote>();
        prev.forEach((n) => mergedMap.set(n.id, { ...n }));
        data.notes.forEach((incoming) => {
          const existingKey = Array.from(mergedMap.keys()).find(
            (k) => k === incoming.id || mergedMap.get(k)?.title === incoming.title
          );
          if (existingKey) {
            const existing = mergedMap.get(existingKey)!;
            // Keep the one with newer updatedAt
            if ((incoming.updatedAt || 0) > (existing.updatedAt || 0)) {
              mergedMap.set(existingKey, incoming);
            }
          } else {
            mergedMap.set(incoming.id, incoming);
          }
        });
        return Array.from(mergedMap.values());
      });
    }
  };

  // Reset to default sample tasks and notes
  const handleResetToDefaults = () => {
    setTasks(STARTER_TASKS);
    setNotes(STARTER_NOTES);
  };

  // Count pending today
  const pendingToday = tasks.filter((t) => !t.history[todayStr]?.completed).length;

  return (
    <MobileFrame>
      {/* App Top Bar */}
      <header className="h-11 px-4 border-b border-zinc-800/80 bg-[#121422]/90 backdrop-blur-md flex items-center justify-between z-20 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center text-white text-xs shadow-md shadow-violet-600/20">
            🌀
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-zinc-100 tracking-wide">
              دوامة أوبسيديان
            </span>
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-violet-500/10 text-violet-300 font-mono border border-violet-500/20">
              Vortex
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            id="open-install-modal-btn"
            onClick={() => setIsInstallOpen(true)}
            className="flex items-center gap-1 text-[11px] font-semibold text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/80 px-2.5 py-1 rounded-xl border border-emerald-500/40 transition-all shadow-sm active:scale-95"
            title="تثبيت التطبيق على الهاتف بصيغة APK"
          >
            <Smartphone size={13} className="text-emerald-400" />
            <span>تثبيت APK</span>
          </button>

          <button
            id="open-backup-modal-btn"
            onClick={() => setIsBackupOpen(true)}
            className="flex items-center gap-1 text-[11px] font-medium text-zinc-300 bg-zinc-800/90 hover:bg-zinc-700/90 px-2.5 py-1 rounded-xl border border-zinc-700/60 transition-all shadow-sm active:scale-95"
            title="تصدير واستيراد نسخة احتياطية JSON"
          >
            <Database size={13} className="text-cyan-400" />
            <span>نسخ JSON</span>
          </button>
        </div>
      </header>

      {/* Active Tab View */}
      {activeTab === 'today' && (
        <TodayTasksView
          tasks={tasks}
          onToggleTaskToday={handleToggleTaskToday}
          onResetTaskToZero={handleResetTaskToZero}
          onOpenAddTask={() => setIsAddTaskOpen(true)}
          onSelectNote={handleSelectNoteByTitle}
          notes={notes}
          onOpenBackup={() => setIsBackupOpen(true)}
          onOpenInstall={() => setIsInstallOpen(true)}
        />
      )}

      {activeTab === 'stats' && (
        <StatsDashboardView
          tasks={tasks}
          onOpenBackup={() => setIsBackupOpen(true)}
          onOpenInstall={() => setIsInstallOpen(true)}
        />
      )}

      {activeTab === 'notes' && (
        <NotesView
          notes={notes}
          selectedNoteTitle={selectedNoteTitle}
          onSelectNote={handleSelectNoteByTitle}
          onUpdateNote={handleUpdateNote}
          onCreateNote={handleCreateNote}
          onDeleteNote={handleDeleteNote}
        />
      )}

      {activeTab === 'calendar' && (
        <CalendarLogView
          tasks={tasks}
          onToggleTaskForDate={handleToggleTaskForDate}
        />
      )}

      {/* Bottom Mobile Tab Bar */}
      <MobileBottomNav
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        pendingCount={pendingToday}
      />

      {/* Add Recurring Task Modal */}
      <AddTaskModal
        isOpen={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
        onAddTask={handleAddTask}
        notes={notes}
      />

      {/* Backup & Restore Modal */}
      <BackupModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        tasks={tasks}
        notes={notes}
        onImportData={handleImportData}
        onResetToDefaults={handleResetToDefaults}
      />

      {/* APK / PWA Installation Modal */}
      <InstallModal
        isOpen={isInstallOpen}
        onClose={() => setIsInstallOpen(false)}
      />

      {/* Offline Status Toast */}
      <OfflineIndicator />
    </MobileFrame>
  );
}
