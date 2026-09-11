import React, { useState } from 'react';
import { RecurringTask } from '../types';
import { formatDate, getPastDates } from '../data/starterData';
import { isTaskScheduledOnDate, getScheduleLabel } from '../utils/taskScheduler';
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  Check,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';

interface CalendarLogViewProps {
  tasks: RecurringTask[];
  onToggleTaskForDate: (taskId: string, dateStr: string) => void;
}

export const CalendarLogView: React.FC<CalendarLogViewProps> = ({
  tasks,
  onToggleTaskForDate,
}) => {
  const pastDates = getPastDates(30);
  const [selectedDate, setSelectedDate] = useState<string>(pastDates[pastDates.length - 1]);

  // Tasks scheduled for the selected date
  const scheduledTasksForDate = tasks.filter((t) => isTaskScheduledOnDate(t, selectedDate));
  const completedForDate = scheduledTasksForDate.filter((t) => t.history[selectedDate]?.completed);
  const missedForDate = scheduledTasksForDate.filter((t) => !t.history[selectedDate]?.completed);
  const dayRate = scheduledTasksForDate.length > 0 ? Math.round((completedForDate.length / scheduledTasksForDate.length) * 100) : 0;

  const dateObj = new Date(selectedDate);
  const dayName = dateObj.toLocaleDateString('ar-EG', { weekday: 'long' });
  const fullDateLabel = dateObj.toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-[#0f1118] p-4 pb-24 select-none">
      {/* Header */}
      <div className="mb-4">
        <span className="text-[11px] font-semibold text-violet-400 flex items-center gap-1">
          <CalendarIcon size={13} />
          سجل الأيام والتوثيق
        </span>
        <h1 className="text-xl font-bold text-zinc-100 mt-0.5">سجل الالتزام اليومي</h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          راجع أيامك السابقة واطلع على ما أتممته أو ما فاتك مع إمكانية التعديل
        </p>
      </div>

      {/* Horizontal Scrollable Date Carousel */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-none">
        {pastDates.map((dateStr) => {
          const isSelected = dateStr === selectedDate;
          const d = new Date(dateStr);
          const dayShort = d.toLocaleDateString('ar-EG', { weekday: 'narrow' });
          const dayNum = d.getDate();

          // Count only scheduled tasks for this date
          let dayDoneCount = 0;
          let dayScheduledCount = 0;
          tasks.forEach((t) => {
            if (!isTaskScheduledOnDate(t, dateStr)) return;
            dayScheduledCount++;
            if (t.history[dateStr]?.completed) dayDoneCount++;
          });
          const isHighCommitment = dayScheduledCount > 0 && dayDoneCount / dayScheduledCount >= 0.7;
          const isLow = dayScheduledCount > 0 && dayDoneCount / dayScheduledCount < 0.3;
          const isRestDay = dayScheduledCount === 0;

          return (
            <button
              key={dateStr}
              onClick={() => setSelectedDate(dateStr)}
              className={`flex-shrink-0 w-12 py-2.5 rounded-2xl flex flex-col items-center justify-center transition-all border ${
                isSelected
                  ? 'bg-violet-600 text-white border-violet-400 shadow-md shadow-violet-600/30'
                  : isRestDay
                  ? 'bg-zinc-900 border-zinc-800 text-zinc-600'
                  : 'bg-[#141724] border-zinc-800 text-zinc-400 hover:bg-zinc-800'
              }`}
            >
              <span className="text-[10px] opacity-80">{dayShort}</span>
              <span className="text-sm font-bold font-mono mt-0.5">{dayNum}</span>

              {/* Dot indicator */}
              {isRestDay ? (
                <span className="w-1.5 h-1.5 rounded-full mt-1 bg-zinc-700" />
              ) : (
                <span
                  className={`w-1.5 h-1.5 rounded-full mt-1 ${
                    isSelected
                      ? 'bg-white'
                      : isHighCommitment
                      ? 'bg-emerald-400'
                      : isLow
                      ? 'bg-rose-400'
                      : 'bg-amber-400'
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Day Summary Card */}
      <div className="bg-[#141724] border border-zinc-800/80 rounded-2xl p-4 mb-4 flex items-center justify-between shadow-md">
        <div>
          <span className="text-xs font-semibold text-violet-300">{dayName}</span>
          <h2 className="text-base font-bold text-zinc-100">{fullDateLabel}</h2>
          <span className="text-xs text-zinc-400 mt-1 block">
            {scheduledTasksForDate.length === 0 
              ? 'يوم راحة - لا مهام مبرمجة'
              : `أنجزت ${completedForDate.length} من ${scheduledTasksForDate.length} مهام`}
          </span>
        </div>

        <div className="text-left">
          {scheduledTasksForDate.length === 0 ? (
            <div className="text-2xl font-bold font-mono text-zinc-600">--</div>
          ) : (
            <div
              className={`text-2xl font-bold font-mono ${
                dayRate >= 70 ? 'text-emerald-400' : dayRate >= 40 ? 'text-amber-400' : 'text-rose-400'
              }`}
            >
              {dayRate}%
            </div>
          )}
          <span className="text-[10px] text-zinc-500 font-medium">
            {scheduledTasksForDate.length === 0
              ? 'راحة'
              : dayRate >= 70
              ? 'يوم التزام تام'
              : dayRate >= 40
              ? 'التزام جزئي'
              : 'يوم غير ملتزم'}
          </span>
        </div>
      </div>

      {/* Tasks breakdown for this date */}
      <div className="space-y-2">
        {scheduledTasksForDate.length === 0 ? (
          <div className="text-center py-10 text-zinc-500 text-xs">
            <CalendarIcon size={32} className="mx-auto mb-2 opacity-50" />
            <p>هذا اليوم هو يوم راحة</p>
            <p className="text-[10px] mt-1">لا توجد مهام مبرمجة - استمر في الراحة!</p>
          </div>
        ) : (
          <>
            <h3 className="text-xs font-semibold text-zinc-300 mb-1">
              حالة المهام في هذا اليوم (انقر للتعديل):
            </h3>

            {scheduledTasksForDate.map((task) => {
              const isDone = !!task.history[selectedDate]?.completed;

              return (
                <div
                  key={task.id}
                  onClick={() => onToggleTaskForDate(task.id, selectedDate)}
                  className={`p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                    isDone
                      ? 'bg-emerald-950/20 border-emerald-500/30'
                      : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                        isDone
                          ? 'bg-emerald-500 text-white'
                          : 'border border-zinc-600 text-transparent'
                      }`}
                    >
                      <Check size={14} strokeWidth={3} />
                    </div>
                    <div>
                      <h4
                        className={`text-xs font-semibold ${
                          isDone ? 'text-zinc-200' : 'text-zinc-400'
                        }`}
                      >
                        {task.title}
                      </h4>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {isDone ? 'تم الالتزام في هذه الدورة' : 'لم يتم الالتزام (عادت للصفر)'}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${
                      isDone
                        ? 'bg-emerald-500/10 text-emerald-300'
                        : 'bg-rose-500/10 text-rose-300'
                    }`}
                  >
                    {isDone ? 'ملتزم' : 'غير ملتزم'}
                  </span>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
};
