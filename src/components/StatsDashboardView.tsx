import React, { useState, useMemo } from 'react';
import { RecurringTask } from '../types';
import {
  calculateOverallStats,
  getDailyCommitmentHistory,
  getTaskStats,
  getWeekdayStats,
} from '../utils/statsCalculator';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts';
import {
  CheckCircle,
  XCircle,
  Percent,
  Flame,
  Calendar,
  BarChart3,
  PieChart as PieIcon,
  TrendingUp,
  Activity,
  Layers,
  Sparkles,
  Database,
  Download,
  Smartphone,
} from 'lucide-react';

interface StatsDashboardViewProps {
  tasks: RecurringTask[];
  onOpenBackup?: () => void;
  onOpenInstall?: () => void;
}

export const StatsDashboardView: React.FC<StatsDashboardViewProps> = ({ tasks, onOpenBackup, onOpenInstall }) => {
  const [timeRange, setTimeRange] = useState<number>(30); // 7, 14, 30 days

  // Compute calculated metrics
  const stats = useMemo(
    () => calculateOverallStats(tasks, timeRange),
    [tasks, timeRange]
  );
  const dailyHistory = useMemo(
    () => getDailyCommitmentHistory(tasks, timeRange),
    [tasks, timeRange]
  );
  const taskStats = useMemo(
    () => getTaskStats(tasks, timeRange),
    [tasks, timeRange]
  );
  const weekdayStats = useMemo(
    () => getWeekdayStats(tasks, timeRange),
    [tasks, timeRange]
  );

  // 1. Donut Chart Data: Committed vs Missed
  const donutData = useMemo(() => {
    return [
      { name: 'أيام الالتزام', value: stats.totalCommittedDays, color: '#10b981' },
      { name: 'أيام عدم الالتزام', value: stats.totalMissedDays, color: '#f43f5e' },
    ];
  }, [stats]);

  // 2. Bar Chart Data (By Task)
  const taskBarData = useMemo(() => {
    return taskStats.map((item) => ({
      name: item.task.title.length > 12 ? item.task.title.slice(0, 12) + '..' : item.task.title,
      fullName: item.task.title,
      ملتزم: item.committedDays,
      غير_ملتزم: item.missedDays,
      نسبة: item.rate,
    }));
  }, [taskStats]);

  // 3. Area Trend Chart Data
  const trendData = useMemo(() => {
    return dailyHistory.map((d, i) => {
      // slice date to MM/DD
      const shortDate = d.date.slice(5);
      return {
        date: shortDate,
        dayName: d.dayName,
        نسبة_الالتزام: d.rate,
      };
    });
  }, [dailyHistory]);

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-[#0f1118] p-4 pb-24 select-none">
      {/* View Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-[11px] font-semibold text-violet-400 flex items-center gap-1">
            <BarChart3 size={13} />
            إحصائيات ومبيانات الالتزام
          </span>
          <h1 className="text-xl font-bold text-zinc-100 mt-0.5">مؤشرات الأداء بكل الأنواع</h1>
        </div>

        {/* Time Range Filter */}
        <div className="flex items-center bg-zinc-900/90 rounded-xl p-0.5 border border-zinc-800 text-xs">
          <button
            onClick={() => setTimeRange(7)}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              timeRange === 7
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            7 أيام
          </button>
          <button
            onClick={() => setTimeRange(14)}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              timeRange === 14
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            14 يوم
          </button>
          <button
            onClick={() => setTimeRange(30)}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              timeRange === 30
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            30 يوم
          </button>
        </div>
      </div>

      {/* Primary KPI Cards Grid */}
      <div className="grid grid-cols-2 gap-2.5 mb-4">
        {/* Committed Days Card */}
        <div className="bg-[#141724] border border-emerald-500/20 rounded-2xl p-3.5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold text-emerald-400">أيام الالتزام</span>
            <CheckCircle size={16} className="text-emerald-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-zinc-100 font-mono">
              {stats.totalCommittedDays}
            </span>
            <span className="text-[10px] text-zinc-500 block mt-0.5 font-medium">
              يوم ناجح من أصل {stats.totalLoggedDays}
            </span>
          </div>
        </div>

        {/* Missed Days Card */}
        <div className="bg-[#141724] border border-rose-500/20 rounded-2xl p-3.5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold text-rose-400">أيام عدم الالتزام</span>
            <XCircle size={16} className="text-rose-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-rose-400 font-mono">
              {stats.totalMissedDays}
            </span>
            <span className="text-[10px] text-zinc-500 block mt-0.5 font-medium">
              أيام انقطاع أو تراجع
            </span>
          </div>
        </div>

        {/* Overall Commitment Rate Card */}
        <div className="bg-[#141724] border border-violet-500/20 rounded-2xl p-3.5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold text-violet-300">نسبة الالتزام الكلية</span>
            <Percent size={16} className="text-violet-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-violet-300 font-mono">
              {stats.commitmentRate}%
            </span>
            <span className="text-[10px] text-zinc-500 block mt-0.5 font-medium">
              معدل الإنجاز التراكمي
            </span>
          </div>
        </div>

        {/* Streak Card */}
        <div className="bg-[#141724] border border-amber-500/20 rounded-2xl p-3.5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold text-amber-400">أطول سلسلة التزام</span>
            <Flame size={16} className="text-amber-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-amber-400 font-mono">
              {stats.longestStreak}
            </span>
            <span className="text-[10px] text-zinc-500 block mt-0.5 font-medium">
              أيام متواصلة بلا انقطاع
            </span>
          </div>
        </div>
      </div>

      {/* 1. Donut / Pie Chart: الالتزام مقابل عدم الالتزام */}
      <div className="bg-[#131622] border border-zinc-800/80 rounded-2xl p-4 mb-4 shadow-md">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
            <PieIcon size={14} className="text-violet-400" />
            المبيان الدائري: توزيع الالتزام مقابل عدم الالتزام
          </h2>
          <span className="text-[11px] font-mono text-zinc-500">{timeRange} يوم</span>
        </div>

        <div className="h-44 w-full relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={donutData}
                cx="50%"
                cy="50%"
                innerRadius={48}
                outerRadius={68}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {donutData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#181b2a',
                  borderColor: '#2e344e',
                  borderRadius: '12px',
                  fontSize: '12px',
                  direction: 'rtl',
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Center Donut Label */}
          <div className="absolute flex flex-col items-center pointer-events-none">
            <span className="text-xl font-bold font-mono text-zinc-100">
              {stats.commitmentRate}%
            </span>
            <span className="text-[9px] text-zinc-400">التزام</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 pt-2 border-t border-zinc-800/60 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-zinc-300">أيام الالتزام:</span>
            <span className="font-mono font-bold text-emerald-400">
              {stats.totalCommittedDays} يوم
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="text-zinc-300">أيام عدم الالتزام:</span>
            <span className="font-mono font-bold text-rose-400">
              {stats.totalMissedDays} يوم
            </span>
          </div>
        </div>
      </div>

      {/* 2. Area / Line Trend Chart: مسار وتطور نسبة الالتزام */}
      <div className="bg-[#131622] border border-zinc-800/80 rounded-2xl p-4 mb-4 shadow-md">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
            <TrendingUp size={14} className="text-cyan-400" />
            المنحنى البياني: مسار وتطور الالتزام اليومي
          </h2>
          <span className="text-[10px] text-cyan-400 font-mono">النسبة المئوية (%)</span>
        </div>

        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="rateGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#232738" vertical={false} />
              <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={10} domain={[0, 100]} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#181b2a',
                  borderColor: '#2e344e',
                  borderRadius: '12px',
                  fontSize: '11px',
                  direction: 'rtl',
                }}
              />
              <Area
                type="monotone"
                dataKey="نسبة_الالتزام"
                stroke="#8b5cf6"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#rateGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Bar Chart: مقارنة الالتزام مقابل عدم الالتزام لكل مهمة */}
      <div className="bg-[#131622] border border-zinc-800/80 rounded-2xl p-4 mb-4 shadow-md">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
            <BarChart3 size={14} className="text-emerald-400" />
            الأعمدة البيانية: مقارنة المهام (ملتزم vs غير ملتزم)
          </h2>
        </div>

        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={taskBarData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#232738" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#181b2a',
                  borderColor: '#2e344e',
                  borderRadius: '12px',
                  fontSize: '11px',
                  direction: 'rtl',
                }}
              />
              <Bar dataKey="ملتزم" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="غير_ملتزم" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Obsidian-style Heatmap Matrix (مصفوفة الخريطة الحرارية مثل أوبسيديان) */}
      <div className="bg-[#131622] border border-zinc-800/80 rounded-2xl p-4 mb-4 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
            <Activity size={14} className="text-amber-400" />
            الخريطة الحرارية لمصفوفة الأيام (Obsidian Heatmap)
          </h2>
          <span className="text-[10px] text-zinc-500">كثافة الإنجاز</span>
        </div>

        <p className="text-[11px] text-zinc-400 mb-3">
          مربعات الالتزام اليومي؛ كلما كان اللون زاهياً دل على التزامك الكامل بالمهام في ذلك اليوم.
        </p>

        {/* Heatmap Grid */}
        <div className="grid grid-cols-7 sm:grid-cols-10 gap-1.5 p-1 bg-zinc-950/60 rounded-xl border border-zinc-800/60">
          {dailyHistory.map((d) => {
            let bgClass = 'bg-zinc-800/60 border-zinc-700/40 text-zinc-500';
            if (d.rate >= 80) bgClass = 'bg-emerald-500 border-emerald-400 text-white font-bold';
            else if (d.rate >= 50) bgClass = 'bg-emerald-600/80 border-emerald-500/70 text-white';
            else if (d.rate >= 25) bgClass = 'bg-violet-700/60 border-violet-600 text-zinc-200';
            else bgClass = 'bg-rose-950/40 border-rose-900/40 text-rose-400';

            return (
              <div
                key={d.date}
                className={`aspect-square rounded-lg border flex flex-col items-center justify-center p-1 transition-transform hover:scale-105 cursor-pointer ${bgClass}`}
                title={`${d.date} (${d.dayName}): التزام ${d.rate}% (${d.committed} مهام)`}
              >
                <span className="text-[9px] font-mono leading-none">{d.date.slice(8)}</span>
                <span className="text-[7px] leading-none mt-0.5 opacity-80">{d.rate}%</span>
              </div>
            );
          })}
        </div>

        {/* Heatmap intensity scale */}
        <div className="flex items-center justify-between mt-3 text-[10px] text-zinc-500 pt-2 border-t border-zinc-800/50">
          <span>عدم التزام (0%)</span>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-rose-950/60 border border-rose-900" />
            <span className="w-2.5 h-2.5 rounded bg-zinc-800" />
            <span className="w-2.5 h-2.5 rounded bg-violet-700/60" />
            <span className="w-2.5 h-2.5 rounded bg-emerald-600" />
            <span className="w-2.5 h-2.5 rounded bg-emerald-500" />
          </div>
          <span>التزام تام (100%)</span>
        </div>
      </div>

      {/* 5. Weekday Performance Bar Chart (الالتزام بحسب أيام الأسبوع) */}
      <div className="bg-[#131622] border border-zinc-800/80 rounded-2xl p-4 shadow-md">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
            <Calendar size={14} className="text-violet-400" />
            نسبة الالتزام بحسب أيام الأسبوع
          </h2>
          <span className="text-[10px] text-zinc-500">أداء كل يوم</span>
        </div>

        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weekdayStats} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#232738" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={10} domain={[0, 100]} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#181b2a',
                  borderColor: '#2e344e',
                  borderRadius: '12px',
                  fontSize: '11px',
                  direction: 'rtl',
                }}
              />
              <Bar dataKey="rate" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 6. APK / Mobile App Install Card */}
      {onOpenInstall && (
        <div className="bg-gradient-to-r from-emerald-950/40 via-[#131a22] to-teal-950/30 border border-emerald-500/25 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <Smartphone size={18} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-bold text-zinc-100">تثبيت التطبيق (Android APK)</h3>
                <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                  APK
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 mt-0.5">
                تثبيت كحزمة هاتف تعمل ملء الشاشة بدون شريط متصفح وبدون إنترنت
              </p>
            </div>
          </div>

          <button
            onClick={onOpenInstall}
            className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all flex-shrink-0 active:scale-95"
          >
            <Download size={13} />
            <span>تثبيت APK</span>
          </button>
        </div>
      )}

      {/* 7. Backup & Export Prompt Card */}
      {onOpenBackup && (
        <div className="bg-gradient-to-r from-violet-950/40 via-[#131625] to-cyan-950/30 border border-violet-500/20 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 flex-shrink-0">
              <Database size={18} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-zinc-100">نسخة احتياطية لبياناتك (JSON)</h3>
              <p className="text-[10px] text-zinc-400 mt-0.5">
                احفظ جميع سجلات التزامك والملاحظات في ملف JSON على جهازك
              </p>
            </div>
          </div>

          <button
            onClick={onOpenBackup}
            className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-violet-600/20 transition-all flex-shrink-0 active:scale-95"
          >
            <Download size={13} />
            <span>تصدير / استيراد</span>
          </button>
        </div>
      )}
    </div>
  );
};
