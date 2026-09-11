import React, { useState, useEffect } from 'react';
import { loadPlan, savePlan, toggleStudySessionCompletion, isStudySessionCompletedToday, addCustomSession, removeCustomSession, updateCustomSession, getTodayPlanStats, WeeklyPlan, StudyPlanItem } from '../utils/planUtils';
import { BookOpen, Plus, Trash2, CheckCircle2, Circle, Clock, Edit2, Save, X } from 'lucide-react';

interface PlanViewProps {
  onOpenAddTask?: () => void;
}

export const PlanView: React.FC<PlanViewProps> = ({ onOpenAddTask }) => {
  const [plan, setPlan] = useState<WeeklyPlan>(loadPlan());
  const [sessionCompleted, setSessionCompleted] = useState<boolean>(isStudySessionCompletedToday());
  const [editingSession, setEditingSession] = useState<StudyPlanItem | null>(null);
  const [isAddingSession, setIsAddingSession] = useState(false);

  // نموذج إضافة جلسة مخصصة
  const [newSessionTitle, setNewSessionTitle] = useState('');
  const [newSessionSubject, setNewSessionSubject] = useState('');
  const [newSessionDuration, setNewSessionDuration] = useState(30);
  const [newSessionPriority, setNewSessionPriority] = useState<'عالية' | 'متوسطة' | 'منخفضة'>('متوسطة');

  useEffect(() => {
    setSessionCompleted(isStudySessionCompletedToday());
  }, []);

  const handleToggleMainSession = () => {
    toggleStudySessionCompletion();
    setSessionCompleted(!sessionCompleted);
  };

  const handleSavePlan = () => {
    savePlan(plan);
  };

  const handleAddCustomSession = () => {
    if (!newSessionTitle.trim()) return;
    
    const newSession = addCustomSession({
      title: newSessionTitle,
      subject: newSessionSubject,
      duration: newSessionDuration,
      priority: newSessionPriority,
      completedToday: false,
    });
    
    setPlan(loadPlan());
    setIsAddingSession(false);
    setNewSessionTitle('');
    setNewSessionSubject('');
    setNewSessionDuration(30);
    setNewSessionPriority('متوسطة');
  };

  const handleDeleteSession = (sessionId: string) => {
    removeCustomSession(sessionId);
    setPlan(loadPlan());
  };

  const handleStartEditing = (session: StudyPlanItem) => {
    setEditingSession({ ...session });
  };

  const handleSaveEdit = () => {
    if (editingSession) {
      updateCustomSession(editingSession.id, editingSession);
      setPlan(loadPlan());
      setEditingSession(null);
    }
  };

  const stats = getTodayPlanStats();
  const progressPercent = stats.totalMinutes > 0 
    ? Math.round((stats.completedMinutes / stats.totalMinutes) * 100) 
    : 0;

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-[#0f1118] p-4 pb-20">
      {/* رأس الصفحة */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-white">خطة الدراسة</h1>
          <p className="text-sm text-zinc-400">نظّم جلساتك اليومية والأسبوعية</p>
        </div>
        <button
          onClick={onOpenAddTask}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-600 text-white shadow-lg hover:bg-violet-500"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* بطاقة التقدم اليومي */}
      <div className="bg-gradient-to-br from-violet-950/40 via-[#161a28] to-[#121422] border border-violet-800/30 rounded-2xl p-4 mb-4 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              <Clock size={14} className="text-cyan-400" />
              تقدم اليوم
            </span>
            <div className="text-2xl font-bold text-zinc-100 font-mono">
              {stats.completedMinutes} <span className="text-zinc-500 text-sm font-normal">من {stats.totalMinutes} دقيقة</span>
            </div>
            <p className="text-[11px] text-zinc-400">
              {stats.completedSessions} من {stats.sessionsCount} جلسات
            </p>
          </div>

          {/* مؤشر دائري */}
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
                strokeDasharray={`${progressPercent}, 100`}
                strokeWidth="3.2"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-xs font-bold text-zinc-100 font-mono">{progressPercent}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* جلسة الدراسة الرئيسية */}
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-zinc-300 mb-2 flex items-center gap-2">
          <BookOpen size={16} className="text-violet-400" />
          الجلسة اليومية المركزة
        </h2>
        <div className={`p-4 rounded-2xl border transition-all ${
          sessionCompleted
            ? 'bg-emerald-950/20 border-emerald-500/30'
            : 'bg-[#131622] border-zinc-800'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">جلسة دراسة شاملة</h3>
              <p className="text-xs text-zinc-400 mt-1">
                {plan.studySession.duration} دقيقة لجميع المواد — الهاتف بعيد
              </p>
            </div>
            <button
              onClick={handleToggleMainSession}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                sessionCompleted
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                  : 'border-2 border-zinc-600 hover:border-violet-400 text-transparent'
              }`}
            >
              <CheckCircle2 size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* الجلسات المخصصة */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
            <Clock size={16} className="text-cyan-400" />
            جلسات إضافية
          </h2>
          <button
            onClick={() => setIsAddingSession(true)}
            className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1"
          >
            <Plus size={14} />
            إضافة
          </button>
        </div>

        {plan.customSessions.length === 0 ? (
          <div className="text-center py-6 text-zinc-500 text-xs border border-dashed border-zinc-800 rounded-xl">
            لا توجد جلسات إضافية. أضف جلسات لمواد محددة.
          </div>
        ) : (
          <div className="space-y-2">
            {plan.customSessions.map((session) => (
              <div
                key={session.id}
                className="p-3 rounded-xl border border-zinc-800 bg-[#131622] flex items-center justify-between"
              >
                {editingSession?.id === session.id ? (
                  // وضع التعديل
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={editingSession.title}
                      onChange={(e) => setEditingSession({ ...editingSession, title: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1 text-xs text-white"
                      placeholder="العنوان"
                    />
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editingSession.subject}
                        onChange={(e) => setEditingSession({ ...editingSession, subject: e.target.value })}
                        className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1 text-xs text-white"
                        placeholder="المادة"
                      />
                      <input
                        type="number"
                        value={editingSession.duration}
                        onChange={(e) => setEditingSession({ ...editingSession, duration: parseInt(e.target.value) || 0 })}
                        className="w-16 bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1 text-xs text-white text-center"
                        placeholder="دقيقة"
                      />
                    </div>
                    <select
                      value={editingSession.priority}
                      onChange={(e) => setEditingSession({ ...editingSession, priority: e.target.value as any })}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1 text-xs text-white"
                    >
                      <option value="عالية">أولوية عالية</option>
                      <option value="متوسطة">أولوية متوسطة</option>
                      <option value="منخفضة">أولوية منخفضة</option>
                    </select>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleSaveEdit}
                        className="flex-1 py-1 bg-emerald-600 text-white rounded-lg text-xs flex items-center justify-center gap-1"
                      >
                        <Save size={12} /> حفظ
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingSession(null)}
                        className="flex-1 py-1 bg-zinc-700 text-white rounded-lg text-xs flex items-center justify-center gap-1"
                      >
                        <X size={12} /> إلغاء
                      </button>
                    </div>
                  </div>
                ) : (
                  // وضع العرض
                  <>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">{session.title}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                          session.priority === 'عالية' ? 'bg-red-500/20 text-red-300' :
                          session.priority === 'متوسطة' ? 'bg-amber-500/20 text-amber-300' :
                          'bg-zinc-700 text-zinc-300'
                        }`}>
                          {session.priority}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        {session.subject} • {session.duration} دقيقة
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleStartEditing(session)}
                        className="p-1.5 text-zinc-400 hover:text-violet-400 rounded-lg"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteSession(session.id)}
                        className="p-1.5 text-zinc-400 hover:text-red-400 rounded-lg"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* نموذج إضافة جلسة */}
      {isAddingSession && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-[#131622] border border-zinc-800 rounded-2xl w-full max-w-sm p-4">
            <h3 className="text-sm font-bold text-white mb-3">إضافة جلسة جديدة</h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">العنوان</label>
                <input
                  type="text"
                  value={newSessionTitle}
                  onChange={(e) => setNewSessionTitle(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white"
                  placeholder="مثال: مراجعة الرياضيات"
                />
              </div>
              
              <div>
                <label className="text-xs text-zinc-400 block mb-1">المادة</label>
                <input
                  type="text"
                  value={newSessionSubject}
                  onChange={(e) => setNewSessionSubject(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white"
                  placeholder="مثال: رياضيات، فيزياء..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">المدة (دقيقة)</label>
                  <input
                    type="number"
                    value={newSessionDuration}
                    onChange={(e) => setNewSessionDuration(parseInt(e.target.value) || 0)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white text-center"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">الأولوية</label>
                  <select
                    value={newSessionPriority}
                    onChange={(e) => setNewSessionPriority(e.target.value as any)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-2 text-xs text-white"
                  >
                    <option value="عالية">عالية</option>
                    <option value="متوسطة">متوسطة</option>
                    <option value="منخفضة">منخفضة</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setIsAddingSession(false)}
                className="flex-1 py-2 bg-zinc-800 text-white rounded-lg text-xs"
              >
                إلغاء
              </button>
              <button
                onClick={handleAddCustomSession}
                className="flex-1 py-2 bg-violet-600 text-white rounded-lg text-xs"
              >
                إضافة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
