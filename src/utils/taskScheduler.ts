import { RecurringTask } from '../types';

const DAY_NAMES = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

/** هل المهمة مبرمجة في هذا التاريخ؟ */
export function isTaskScheduledOnDate(
  task: Pick<RecurringTask, 'recurrence' | 'activeDays'>,
  dateStr: string
): boolean {
  const d = new Date(`${dateStr}T12:00:00`);
  if (isNaN(d.getTime())) return true;
  const dow = d.getDay();
  switch (task.recurrence) {
    case 'daily': return true;
    case 'weekdays': return dow >= 1 && dow <= 5;
    case 'weekly':
    case 'custom': {
      const days = task.activeDays?.length ? task.activeDays : [1, 3, 5];
      return days.includes(dow);
    }
    default: return true;
  }
}

/** وصف الجدول للعرض */
export function getScheduleLabel(task: Pick<RecurringTask, 'recurrence' | 'activeDays'>): string {
  if (task.recurrence === 'daily') return 'كل يوم';
  if (task.recurrence === 'weekdays') return 'الإثنين – الجمعة';
  const days = task.activeDays?.length ? task.activeDays : [1, 3, 5];
  return [...days].sort().map((d) => DAY_NAMES[d]).join('، ');
}

/** سلسلة الالتزام: أيام الراحة لا تقطع، واليوم غير المنتهي لا يقطع */
export function calculateStreak(task: RecurringTask, todayStr: string): number {
  const dates = Object.keys(task.history).sort().reverse();
  let streak = 0;
  for (const d of dates) {
    if (d > todayStr) continue;
    if (!isTaskScheduledOnDate(task, d)) continue;
    const done = !!task.history[d]?.completed;
    if (done) streak++;
    else if (d === todayStr) continue;
    else break;
  }
  return streak;
}
