import React, { useState } from 'react';
import { RecurringTask, ObsidianNote } from '../../types';
import { formatDate } from '../../data/starterData';
import {
  CheckCircle2,
  Circle,
  RotateCcw,
  Flame,
  Plus,
  ArrowUpRight,
  Sparkles,
  Calendar,
  Check,
  ChevronLeft,
  Repeat,
  Zap,
  Database,
  Smartphone,
} from 'lucide-react';

interface TodayTasksViewProps {
  tasks: RecurringTask[];
  onToggleTaskToday: (taskId: string) => void;
  onResetTaskToZero: (taskId: string) => void;
  onOpenAddTask: () => void;
  onSelectNote: (noteTitle: string) => void;
  notes: ObsidianNote[];
  onOpenBackup?: () => void;
  onOpenInstall?: () => void;
}

export const TodayTasksView: React.FC<TodayTasksViewProps> = ({
  tasks,
  onToggleTaskToday,
  onResetTaskToZero,
  onOpenAddTask,
  onSelectNote,
  onOpenBackup,
  onOpenInstall,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const todayStr = formatDate(new Date());

  const completedTasks = tasks.filter((t) => t.history[todayStr]?.completed);
  const pendingTasks = tasks.filter((t) => !t.history[todayStr]?.completed);

  const completionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  const displayTasks =
    filter === 'all' ? tasks : filter === 'completed' ? completedTasks : pendingTasks;

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-[#0f1118] p-4 pb-20 select-none">
      {/* Date & Title Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-[11px] font-semibold text-violet-400 flex items-center gap-1">
            <Calendar size={13} />
            {new Date().toLocaleDateString('ar-EG', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </span>
          <h1 className="text-xl font-bold text-zinc-100 mt-0.5">دوامة المهام والعادات</h1>
        </div>

        <div className="flex items-center gap-1.5">
          {onOpenInstall && (
            <button
              id="header-install-apk-btn"
              onClick={onOpenInstall}
              className="w-9 h-9 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/40 text-emerald-400 flex items-center justify-center transition-all active:scale-95 shadow-sm"
              title="تثبيت التطبيق على الهاتف بصيغة APK"
            >
              <Smartphone size={15} />
            </button>
          )}

          {onOpenBackup && (
            <button
              id="header-backup-btn"
              onClick={onOpenBackup}
              className="w-9 h-9 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 flex items-center justify-center transition-all active:scale-95 shadow-sm"
              title="النسخ الاحتياطي وتصدير JSON"
            >
              <Database size={15} className="text-cyan-400" />
            </button>
          )}

          <button
            id="quick-add-task-header-btn"
            onClick={onOpenAddTask}
            className="w-9 h-9 rounded-xl bg-violet-600 hover:bg-violet-500 text-white flex items-center justify-center shadow-lg shadow-violet-600/30 transition-all active:scale-95"
            title="إضافة مهمة متكررة جديدة"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      {/* Daily Progress Card with Vortex Loop explanation */}
      <div className="bg-gradient-to-br from-violet-950/40 via-[#161a28] to-[#121422] border border-violet-800/30 rounded-2xl p-4 mb-4 relative overflow-hidden shadow-lg">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              <RotateCcw size={14} className="text-cyan-400 animate-spin-slow" />
              دورة اليوم (تعود لنقطة الصفر)
            </span>
            <div className="text-2xl font-bold text-zinc-100 font-mono">
              {completedTasks.length} <span className="text-zinc-500 text-sm font-normal">من {tasks.length} مهام</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-snug max-w-[210px]">
              عند إتمام المهمة اليوم، تُسجل في إحصائيات التزامك، ثم تعود للدوران من نقطة الصفر للغد.
            </p>
          </div>

          {/* Circular Progress Indicator */}
          <div className="relative w-18 h-18 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 36 36">
              <path
                className="text-zinc-800"
                strokeWidth="3.2"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-violet-500 transition-all duration-700 ease-out"
                strokeDasharray={`${completionRate}, 100`}
                strokeWidth="3.2"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-xs font-bold text-zinc-100 font-mono">{completionRate}%</span>
              <span className="text-[8px] text-zinc-500">التزام</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-zinc-900/80 rounded-xl border border-zinc-800/80 mb-3 text-xs">
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
            filter === 'all'
              ? 'bg-zinc-800 text-zinc-100 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          الكل ({tasks.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
            filter === 'pending'
              ? 'bg-amber-500/20 text-amber-300 font-semibold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          قيد الانتظار ({pendingTasks.length})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
            filter === 'completed'
              ? 'bg-emerald-500/20 text-emerald-300 font-semibold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          تمت اليوم ({completedTasks.length})
        </button>
      </div>

      {/* Task Cards List */}
      <div className="space-y-2.5">
        {displayTasks.map((task) => {
          const isDoneToday = !!task.history[todayStr]?.completed;

          // Calculate task streak
          let streak = 0;
          const past = Object.keys(task.history).sort().reverse();
          for (const d of past) {
            if (task.history[d]?.completed) streak++;
            else break;
          }

          return (
            <div
              key={task.id}
              className={`p-3.5 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                isDoneToday
                  ? 'bg-[#141724]/90 border-emerald-500/30'
                  : 'bg-[#131622] border-zinc-800/80 hover:border-zinc-700/80'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                {/* 1-Tap Completion Checkbox */}
                <button
                  id={`toggle-task-${task.id}`}
                  onClick={() => onToggleTaskToday(task.id)}
                  className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all flex-shrink-0 mt-0.5 active:scale-90 ${
                    isDoneToday
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                      : 'border-2 border-zinc-600 hover:border-violet-400 text-transparent'
                  }`}
                  title={isDoneToday ? 'إلغاء التحديد' : 'تحديد كمنجز'}
                >
                  <Check size={16} strokeWidth={3} />
                </button>

                {/* Task Details */}
                <div className="flex-1 min-w-0 text-right">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-semibold truncate ${
                        isDoneToday ? 'line-through text-zinc-400' : 'text-zinc-100'
                      }`}
                    >
                      {task.title}
                    </span>
                  </div>

                  {task.description && (
                    <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-1">
                      {task.description}
                    </p>
                  )}

                  {/* Badges Bar */}
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {/* Recurrence & Reset indicator */}
                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-zinc-800/80 text-cyan-300 font-mono">
                      <Repeat size={10} />
                      تعود للصفر يومياً
                    </span>

                    {/* Streak badge */}
                    {streak > 0 && (
                      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 font-mono font-semibold">
                        <Flame size={11} className="text-amber-400" />
                        {streak} يوم التزام
                      </span>
                    )}

                    {/* Obsidian Linked Note */}
                    {task.linkedNoteTitle && (
                      <button
                        onClick={() => onSelectNote(task.linkedNoteTitle!)}
                        className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-violet-500/15 hover:bg-violet-500/25 text-violet-300 transition-colors"
                        title="فتح ملاحظة أوبسيديان المرتبطة"
                      >
                        <span>[[{task.linkedNoteTitle}]]</span>
                        <ArrowUpRight size={10} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Reset or Actions */}
                {isDoneToday && (
                  <button
                    onClick={() => onResetTaskToZero(task.id)}
                    className="p-1.5 text-zinc-500 hover:text-cyan-400 rounded-lg hover:bg-zinc-800 transition-colors"
                    title="تصفير المهمة يدوياً الآن"
                  >
                    <RotateCcw size={13} />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {displayTasks.length === 0 && (
          <div className="text-center py-10 text-zinc-500 text-xs">
            لا توجد مهام مطابقة للتصفية الحالية.
          </div>
        )}
      </div>
    </div>
  );
};
