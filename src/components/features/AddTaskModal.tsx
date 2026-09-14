import React, { useState } from 'react';
import { RecurringTask, ObsidianNote, RecurrenceType } from '../../types';
import { formatDate } from '../../data/starterData';
import { X, Plus, Repeat, BookOpen, Heart, Dumbbell, Zap, Droplet, Brain } from 'lucide-react';

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

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const todayStr = formatDate(new Date());
    const newTask: RecurringTask = {
      id: `task-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || 'تتكرر يومياً وتعود لنقطة الصفر عند إتمامها',
      category,
      icon: 'Zap',
      color: '#8b5cf6',
      recurrence,
      targetCount: 1,
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
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="bg-[#131622] border border-zinc-800 rounded-3xl w-full max-w-sm p-5 shadow-2xl text-right overflow-hidden"
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
              </select>
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
