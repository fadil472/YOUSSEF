import { RecurringTask, ObsidianNote } from '../types';
import { isTaskScheduledOnDate } from '../utils/taskScheduler';

// Helper to format date YYYY-MM-DD
export function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Generate past 30 days of dates
export function getPastDates(daysCount = 30): string[] {
  const dates: string[] = [];
  const today = new Date();
  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    dates.push(formatDate(d));
  }
  return dates;
}

const past30Days = getPastDates(30);
const todayStr = formatDate(new Date());

// Helper to generate simulated history with realistic completion patterns respecting schedule
function generateHistory(
  schedule: Pick<RecurringTask, 'recurrence' | 'activeDays'>,
  targetCount: number,
  rate: number,
  seed: number
): Record<string, { completed: boolean; count: number }> {
  const history: Record<string, { completed: boolean; count: number }> = {};
  past30Days.forEach((date, idx) => {
    if (!isTaskScheduledOnDate(schedule, date)) return; // أيام الراحة: بلا سجل
    if (date === todayStr) {
      history[date] = { completed: false, count: 0 };
      return;
    }
    const isMissed = (idx * 7 + seed) % 10 > Math.floor(rate * 10);
    history[date] = { completed: !isMissed, count: isMissed ? 0 : targetCount };
  });
  return history;
}

export const STARTER_TASKS: RecurringTask[] = [
  {
    id: 'task-study-session',
    title: 'جلسة الدراسة اليومية',
    description: 'جلسة واحدة مركزة (90 دقيقة) لجميع المواد — الهاتف بعيد',
    category: 'دراسة',
    icon: 'BookOpen',
    color: '#8b5cf6',
    recurrence: 'daily',
    targetCount: 1,
    currentCountToday: 0,
    linkedNoteTitle: 'خطة الدراسة للثانوي التأهيلي',
    createdAt: past30Days[0],
    history: generateHistory({ recurrence: 'daily' }, 1, 0.85, 2),
  },
  {
    id: 'task-calisthenics',
    title: 'الكاليستنكس (تمارين وزن الجسم)',
    description: 'تتبع مدة الجلسة بالدقائق — تصل 45 دقيقة وتُعتبر منجزة',
    category: 'صحة_ولياقة',
    icon: 'Dumbbell',
    color: '#f59e0b',
    recurrence: 'custom',
    activeDays: [1, 3, 5], // الإثنين، الأربعاء، الجمعة
    targetCount: 45,
    unit: 'دقيقة',
    step: 5,
    currentCountToday: 0,
    linkedNoteTitle: 'برنامج الكاليستنكس للمبتدئين',
    createdAt: past30Days[0],
    history: generateHistory({ recurrence: 'custom', activeDays: [1, 3, 5] }, 45, 0.8, 3),
  },
  {
    id: 'task-french-vocab',
    title: 'مفردات فرنسية جديدة',
    description: 'تعلم 10 كلمات جديدة يومياً وسجلها في القاموس',
    category: 'لغات',
    icon: 'Languages',
    color: '#3b82f6',
    recurrence: 'daily',
    targetCount: 10,
    unit: 'كلمة',
    step: 1,
    currentCountToday: 0,
    linkedNoteTitle: 'قاموس الكلمات الفرنسية',
    createdAt: past30Days[0],
    history: generateHistory({ recurrence: 'daily' }, 10, 0.8, 4),
  },
  {
    id: 'task-french-listening',
    title: 'استماع بالفرنسية',
    description: '15 دقيقة استماع: بودكاست مبسط أو فيديوهات تعليمية',
    category: 'لغات',
    icon: 'Headphones',
    color: '#06b6d4',
    recurrence: 'daily',
    targetCount: 15,
    unit: 'دقيقة',
    step: 5,
    currentCountToday: 0,
    createdAt: past30Days[0],
    history: generateHistory({ recurrence: 'daily' }, 15, 0.75, 5),
  },
  {
    id: 'task-french-science',
    title: 'قراءة درس علمي بالفرنسية',
    description: 'قراءة جزء من درس الرياضيات أو الفيزياء بالفرنسية',
    category: 'لغات',
    icon: 'GraduationCap',
    color: '#10b981',
    recurrence: 'daily',
    targetCount: 15,
    unit: 'دقيقة',
    step: 5,
    currentCountToday: 0,
    createdAt: past30Days[0],
    history: generateHistory({ recurrence: 'daily' }, 15, 0.7, 6),
  },
];

export const STARTER_NOTES: ObsidianNote[] = [
  {
    id: 'note-reading-plan',
    title: 'خطة القراءة السنوية',
    tags: ['كتب', 'قراءة', 'أهداف_2026'],
    updatedAt: Date.now() - 86400000 * 2,
    content: `# خطة القراءة السنوية 📚

المهمة المتكررة المرتبطة: [[قراءة 20 صفحة يومياً]]

الالتزام اليومي البسيط بقراءة 20 صفحة يعني إنهاء حوالي 18 إلى 24 كتاباً في السنة الواحدة بكل يسر.

## الكتب الحالية:
- [x] العادات الذرية (Atomic Habits) - جيمس كلير
- [ ] العمل العميق (Deep Work) - كال نيوبورت
- [ ] التفكير السريع والبطيء - دانيال كانمان

> "أنت لا ترتقي إلى مستوى أهدافك، بل تهبط إلى مستوى أنظمتك وعاداتك اليومية."
`,
  },
  {
    id: 'note-deep-work',
    title: 'ملاحظات العمل المركز',
    tags: ['إنتاجية', 'تركيز', 'عادات'],
    updatedAt: Date.now() - 86400000 * 3,
    content: `# ملاحظات العمل المركز (Deep Work) ⚡

المهمة المتكررة المرتبطة: [[جلسة عمل عميق (Deep Work)]]

عند إتمام الجلسة اليوم، يتم تسجيل الالتزام ثم **تعود المهمة لنقطة الصفر** للغد.

## قواعد الجلسة الصارمة:
1. وضع الهاتف في غرفة أخرى.
2. حظر جميع مواقع التواصل.
3. العمل على مشروع واحد فقط دون تعدد مهام.
`,
  },
  {
    id: 'note-obsidian-guide',
    title: 'دليل أوبسيديان وإدارة المعرفة',
    tags: ['أوبسيديان', 'زيتلكاستن', 'معرفة'],
    updatedAt: Date.now() - 86400000 * 5,
    content: `# دليل أوبسيديان وإدارة المعرفة 🧠

المهمة المتكررة المرتبطة: [[مراجعة ملاحظات أوبسيديان والزيتلكاستن]]

فلسفة هذا التطبيق مستوحاة من فلسفة أوبسيديان:
- الملاحظات الذرية
- الروابط المتقاطعة [[مثل هذا الرابط]]
- تتبع العادات اليومية التي تتكرر وتدور لتعود لنقطة الصفر مع جمع إحصائيات دقيقة لنسب الالتزام والغياب.
`,
  },
];
