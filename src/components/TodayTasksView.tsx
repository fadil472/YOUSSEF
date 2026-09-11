import React, { useState } from 'react';
import { RecurringTask, ObsidianNote } from '../types';
import { formatDate } from '../data/starterData';
import { isTaskScheduledOnDate, calculateStreak, getScheduleLabel } from '../utils/taskScheduler';
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
  Minus,
  Trash2,
} from 'lucide-react';

interface TodayTasksViewProps {
  tasks: RecurringTask[];
  onToggleTaskToday: (taskId: string) => void;
  onResetTaskToZero: (taskId: string) => void;
  onIncrementTaskToday: (taskId: string, delta: number) => void;
  onDeleteTask: (taskId: string) => void;
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
  onIncrementTaskToday,
  onDeleteTask,
  onOpenAddTask,
  onSelectNote,
  onOpenBackup,
  onOpenInstall,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const todayStr = formatDate(new Date());

  // تصفية المهام المبرمجة فقط لليوم
  const scheduledTasks = tasks.filter((t) => isTaskScheduledOnDate(t, todayStr));
  const restDayTasks = tasks.filter((t) => !isTaskScheduledOnDate(t, todayStr));

  const completedTasks = scheduledTasks.filter((t) => t.history[todayStr]?.completed);
  const pendingTasks = scheduledTasks.filter((t) => !t.history[todayStr]?.completed);

  const completionRate = scheduledTasks.length > 0 ? Math.round((completedTasks.length / scheduledTasks.length) * 100) : 0;

  const displayTasks =
    filter === 'all' ? scheduledTasks : filter === 'completed' ? completedTasks : pendingTasks;

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
              {completedTasks.length} <span className="text-zinc-500 text-sm font-normal">من {scheduledTasks.length} مهام</span>
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
          الكل ({scheduledTasks.length})
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
          const todayData = task.history[todayStr] || { completed: false, count: 0 };
          const isDoneToday = todayData.completed;
          const currentCount = todayData.count ?? 0;
          const isNumericTask = task.targetCount > 1;
          
          // Calculate task streak using the scheduler utility
          const streak = calculateStreak(task, todayStr);

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

                  {/* Numeric Task Progress Bar */}
                  {isNumericTask && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-1">
                        <span>{currentCount} / {task.targetCount} {task.unit || 'وحدة'}</span>
                        <span className="font-mono">{Math.round((currentCount / task.targetCount) * 100)}%</span>
                      </div>
                      <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-violet-600 to-cyan-500 transition-all duration-300"
                          style={{ width: `${Math.min(100, (currentCount / task.targetCount) * 100)}%` }}
                        />
                      </div>
                      
                      {/* Increment/Decrement Buttons */}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => onIncrementTaskToday(task.id, -(task.step || 1))}
                          disabled={currentCount <= 0}
                          className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-300 flex items-center justify-center transition-all active:scale-90"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="flex-1 text-center text-xs font-mono text-zinc-300">
                          {currentCount}
                        </span>
                        <button
                          onClick={() => onIncrementTaskToday(task.id, task.step || 1)}
                          disabled={currentCount >= task.targetCount}
                          className="w-7 h-7 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all active:scale-90 shadow-md shadow-violet-600/30"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Badges Bar */}
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {/* Recurrence & Schedule label */}
                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-zinc-800/80 text-cyan-300 font-mono">
                      <Repeat size={10} />
                      {getScheduleLabel(task)}
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

                {/* 1-Tap Completion Checkbox (only for boolean tasks) */}
                {!isNumericTask && (
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
                )}

                {/* Reset or Actions */}
                <div className="flex items-center gap-1">
                  {isDoneToday && !isNumericTask && (
                    <button
                      onClick={() => onResetTaskToZero(task.id)}
                      className="p-1.5 text-zinc-500 hover:text-cyan-400 rounded-lg hover:bg-zinc-800 transition-colors"
                      title="تصفير المهمة يدوياً الآن"
                    >
                      <RotateCcw size={13} />
                    </button>
                  )}
                  <button
                    onClick={() => onDeleteTask(task.id)}
                    className="p-1.5 text-zinc-500 hover:text-red-400 rounded-lg hover:bg-zinc-800 transition-colors"
                    title="حذف المهمة نهائياً"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
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

      {/* Rest Day Tasks Section */}
      {restDayTasks.length > 0 && filter === 'all' && (
        <div className="mt-6 pt-4 border-t border-zinc-800">
          <h3 className="text-xs font-semibold text-zinc-400 mb-3 flex items-center gap-2">
            <Calendar size={12} />
            مهام في يوم راحة (غير مبرمجة اليوم)
          </h3>
          <div className="space-y-2 opacity-60">
            {restDayTasks.map((task) => (
              <div
                key={task.id}
                className="p-3 rounded-xl border border-zinc-800/50 bg-zinc-900/30 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg border border-zinc-700 flex items-center justify-center text-zinc-600">
                    <Minus size={12} />
                  </div>
                  <span className="text-xs text-zinc-500">{task.title}</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-500">
                  {getScheduleLabel(task)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
