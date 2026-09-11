import React, { useState } from 'react';
import { RecurringTask, ObsidianNote, RecurrenceType } from '../types';
import { formatDate } from '../data/starterData';
import { X, Plus, Repeat, BookOpen, Heart, Dumbbell, Zap, Droplet, Brain, Languages, GraduationCap } from 'lucide-react';
import { getScheduleLabel } from '../utils/taskScheduler';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (task: RecurringTask) => void;
  notes: ObsidianNote[];
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({
  isOpen,
  onClose,
  onAddTask,
  notes,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('تطوير_ذاتي');
  const [linkedNoteTitle, setLinkedNoteTitle] = useState('');
  const [recurrence, setRecurrence] = useState<RecurrenceType>('daily');
  const [activeDays, setActiveDays] = useState<number[]>([1, 3, 5]); // الإثنين، الأربعاء، الجمعة
  const [targetCount, setTargetCount] = useState<number>(1);
  const [unit, setUnit] = useState<string>('');
  const [step, setStep] = useState<number>(1);

  const DAY_NAMES = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

  const toggleDay = (dayIndex: number) => {
    setActiveDays((prev) =>
      prev.includes(dayIndex) ? prev.filter((d) => d !== dayIndex) : [...prev, dayIndex].sort()
    );
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const todayStr = formatDate(new Date());
    const newTask: RecurringTask = {
      id: `task-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || 'تتكرر حسب الجدول المحدد وتعود لنقطة الصفر عند إتمامها',
      category,
      icon: 'Zap',
      color: '#8b5cf6',
      recurrence,
      activeDays: recurrence === 'custom' || recurrence === 'weekly' ? activeDays : undefined,
      targetCount,
      unit: unit.trim() || undefined,
      step,
      currentCountToday: 0,
      linkedNoteTitle: linkedNoteTitle.trim() || undefined,
      createdAt: todayStr,
      history: {
        [todayStr]: { completed: false, count: 0 },
      },
    };

    onAddTask(newTask);
    setTitle('');
    setDescription('');
    setLinkedNoteTitle('');
    setTargetCount(1);
    setUnit('');
    setStep(1);
    setActiveDays([1, 3, 5]);
    onClose();
  };

  const showDaySelector = recurrence === 'custom' || recurrence === 'weekly';

  return (
    <div
      className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="bg-[#131622] border border-zinc-800 rounded-3xl w-full max-w-sm p-5 shadow-2xl text-right overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <h2 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
            <Repeat size={16} className="text-violet-400" />
            إضافة مهمة متكررة جديدة
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 mt-3">
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1">
              اسم المهمة أو العادة:
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: قراءة 30 دقيقة، صلاة الفجر، رياضة..."
              required
              className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1">
              وصف مختصر:
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="تفاصيل العادة أو شروط الإنجاز..."
              className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-violet-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                دورة التكرار:
              </label>
              <select
                value={recurrence}
                onChange={(e) => setRecurrence(e.target.value as RecurrenceType)}
                className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-2.5 py-2 text-xs text-zinc-200 focus:outline-none focus:border-violet-500"
              >
                <option value="daily">يومياً (تصفر 00:00)</option>
                <option value="weekdays">أيام العمل فقط</option>
                <option value="weekly">أسبوعياً</option>
                <option value="custom">مخصص</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                التصنيف:
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-2.5 py-2 text-xs text-zinc-200 focus:outline-none focus:border-violet-500"
              >
                <option value="تطوير_ذاتي">تطوير ذاتي</option>
                <option value="روحانيات">روحانيات</option>
                <option value="صحة_ولياقة">صحة ولياقة</option>
                <option value="إنتاجية">إنتاجية وعمل</option>
                <option value="معرفة">معرفة وأوبسيديان</option>
                <option value="دراسة">دراسة</option>
                <option value="لغات">لغات</option>
              </select>
            </div>
          </div>

          {showDaySelector && (
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-2">
                اختر أيام النشاط:
              </label>
              <div className="flex justify-between gap-1">
                {DAY_NAMES.map((dayName, idx) => {
                  const isActive = activeDays.includes(idx);
                  return (
                    <button
                      key={dayName}
                      type="button"
                      onClick={() => toggleDay(idx)}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                          : 'bg-zinc-900 text-zinc-500 border border-zinc-700 hover:bg-zinc-800'
                      }`}
                    >
                      {dayName.charAt(0)}
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-zinc-500 mt-1.5">
                المحدد: {getScheduleLabel({ recurrence, activeDays })}
              </p>
            </div>
          )}

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                الهدف:
              </label>
              <input
                type="number"
                min="1"
                value={targetCount}
                onChange={(e) => setTargetCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-2.5 py-2 text-xs text-zinc-200 focus:outline-none focus:border-violet-500 text-center"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                الوحدة:
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="دقيقة، كلمة..."
                className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-2.5 py-2 text-xs text-zinc-200 focus:outline-none focus:border-violet-500 text-center"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                الخطوة:
              </label>
              <input
                type="number"
                min="1"
                value={step}
                onChange={(e) => setStep(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-2.5 py-2 text-xs text-zinc-200 focus:outline-none focus:border-violet-500 text-center"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1">
              ربط بملاحظة أوبسيديان (اختياري):
            </label>
            <select
              value={linkedNoteTitle}
              onChange={(e) => setLinkedNoteTitle(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-2.5 py-2 text-xs text-zinc-200 focus:outline-none focus:border-violet-500"
            >
              <option value="">-- بدون ربط --</option>
              {notes.map((n) => (
                <option key={n.id} value={n.title}>
                  [[{n.title}]]
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl text-xs text-zinc-400 hover:bg-zinc-800"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs bg-violet-600 text-white font-medium hover:bg-violet-500 shadow-md shadow-violet-600/30"
            >
              إضافة المهمة للدوامة
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
