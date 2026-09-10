import { RecurringTask, ObsidianNote } from '../types';

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

// Helper to generate simulated history with realistic completion patterns
function generateHistory(rate = 0.85, randomSeed = 1): Record<string, { completed: boolean; count: number }> {
  const history: Record<string, { completed: boolean; count: number }> = {};
  past30Days.forEach((date, idx) => {
    if (date === todayStr) {
      // today will be pending or partially done
      history[date] = { completed: (idx + randomSeed) % 2 === 0, count: 1 };
      return;
    }
    // pseudo-deterministic based on index
    const isMissed = (idx * 7 + randomSeed) % 10 > Math.floor(rate * 10);
    const completed = !isMissed;
    history[date] = {
      completed,
      count: completed ? 1 : 0,
    };
  });
  return history;
}

export const STARTER_TASKS: RecurringTask[] = [
  {
    id: 'task-reading',
    title: 'قراءة 20 صفحة يومياً',
    description: 'تتكرر كل يوم - عند إنهائها تعود لنقطة الصفر 00:00',
    category: 'تطوير_ذاتي',
    icon: 'BookOpen',
    color: '#8b5cf6', // violet
    recurrence: 'daily',
    targetCount: 1,
    currentCountToday: 1,
    linkedNoteTitle: 'خطة القراءة السنوية',
    createdAt: past30Days[0],
    history: generateHistory(0.86, 2),
  },
  {
    id: 'task-quran',
    title: 'الورد القرآني والأذكار',
    description: 'دورة يومية متجددة للسكينة والروحانية',
    category: 'روحانيات',
    icon: 'Heart',
    color: '#10b981', // emerald
    recurrence: 'daily',
    targetCount: 1,
    currentCountToday: 1,
    linkedNoteTitle: 'مذكرات التأمل والورد',
    createdAt: past30Days[0],
    history: generateHistory(0.93, 5),
  },
  {
    id: 'task-workout',
    title: 'الرياضة والنشاط البدني',
    description: 'تمرين كارديو أو حديد لمدة 45 دقيقة',
    category: 'صحة_ولياقة',
    icon: 'Dumbbell',
    color: '#f59e0b', // amber
    recurrence: 'daily',
    targetCount: 1,
    currentCountToday: 0, // not yet today
    linkedNoteTitle: 'جدول اللياقة والتمارين',
    createdAt: past30Days[0],
    history: generateHistory(0.76, 3),
  },
  {
    id: 'task-deep-work',
    title: 'جلسة عمل عميق (Deep Work)',
    description: 'تركيز خالص 90 دقيقة دون أي مشتتات أو هاتف',
    category: 'إنتاجية',
    icon: 'Zap',
    color: '#06b6d4', // cyan
    recurrence: 'daily',
    targetCount: 1,
    currentCountToday: 1,
    linkedNoteTitle: 'ملاحظات العمل المركز',
    createdAt: past30Days[0],
    history: generateHistory(0.80, 7),
  },
  {
    id: 'task-water',
    title: 'شرب 2 لتر ماء',
    description: 'تجديد السوائل طوال اليوم، تصفر يومياً',
    category: 'صحة_ولياقة',
    icon: 'Droplet',
    color: '#3b82f6', // blue
    recurrence: 'daily',
    targetCount: 1,
    currentCountToday: 1,
    createdAt: past30Days[0],
    history: generateHistory(0.90, 1),
  },
  {
    id: 'task-obsidian-review',
    title: 'مراجعة ملاحظات أوبسيديان والزيتلكاستن',
    description: 'ربط الأفكار وتدوين الملاحظات الذرية اليومية',
    category: 'معرفة',
    icon: 'Brain',
    color: '#ec4899', // pink
    recurrence: 'daily',
    targetCount: 1,
    currentCountToday: 0, // pending today
    linkedNoteTitle: 'دليل أوبسيديان وإدارة المعرفة',
    createdAt: past30Days[0],
    history: generateHistory(0.73, 4),
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
