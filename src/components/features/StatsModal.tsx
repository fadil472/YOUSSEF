import React from 'react';
import { Note, Folder, VaultStats } from '../../types';
import {
  BarChart3,
  X,
  Share2,
  FileText,
  Clock,
  Network,
  Orbit,
  AlertCircle,
  Hash,
  FolderTree,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  Link2,
} from 'lucide-react';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: VaultStats;
  notes: Note[];
  folders: Folder[];
  onSelectNote: (noteId: string) => void;
  onResetVault: () => void;
  onExportVault: () => void;
  onImportVault: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({
  isOpen,
  onClose,
  stats,
  notes,
  folders,
  onSelectNote,
  onResetVault,
  onExportVault,
  onImportVault,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="stats-modal-overlay"
      className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="stats-modal-content"
        className="bg-[#11131c] border border-zinc-800/90 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800/80 bg-[#141824]/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-violet-600 to-cyan-500 text-white shadow-lg shadow-violet-500/20">
              <Orbit size={22} className="animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                إحصائيات وتحليلات دوامة المعرفة
                <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/20">
                  تحليل بياني شامل
                </span>
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                نظرة عميقة على كثافة شبكة أفكارك، مستويات الجاذبية المدارية، والروابط المعرفية
              </p>
            </div>
          </div>
          <button
            id="close-stats-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/70 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-[#161a28] border border-zinc-800/80 rounded-2xl p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-zinc-400 mb-2">
                <span className="text-xs">الملاحظات</span>
                <FileText size={16} className="text-violet-400" />
              </div>
              <div>
                <span className="text-2xl font-bold text-zinc-100 font-mono">
                  {stats.totalNotes}
                </span>
                <span className="text-[10px] text-zinc-500 block mt-0.5">ملاحظة مسجلة</span>
              </div>
            </div>

            <div className="bg-[#161a28] border border-zinc-800/80 rounded-2xl p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-zinc-400 mb-2">
                <span className="text-xs">الروابط الدوامية</span>
                <Network size={16} className="text-cyan-400" />
              </div>
              <div>
                <span className="text-2xl font-bold text-cyan-400 font-mono">
                  {stats.totalLinks}
                </span>
                <span className="text-[10px] text-zinc-500 block mt-0.5">تشعبات نشطة</span>
              </div>
            </div>

            <div className="bg-[#161a28] border border-zinc-800/80 rounded-2xl p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-zinc-400 mb-2">
                <span className="text-xs">إجمالي الكلمات</span>
                <BarChart3 size={16} className="text-emerald-400" />
              </div>
              <div>
                <span className="text-2xl font-bold text-zinc-100 font-mono">
                  {stats.totalWords.toLocaleString()}
                </span>
                <span className="text-[10px] text-zinc-500 block mt-0.5">
                  متوسط {stats.avgWordsPerNote}/ملاحظة
                </span>
              </div>
            </div>

            <div className="bg-[#161a28] border border-zinc-800/80 rounded-2xl p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-zinc-400 mb-2">
                <span className="text-xs">زمن القراءة</span>
                <Clock size={16} className="text-amber-400" />
              </div>
              <div>
                <span className="text-2xl font-bold text-amber-400 font-mono">
                  {stats.readingTimeMinutes}
                </span>
                <span className="text-[10px] text-zinc-500 block mt-0.5">دقيقة قراءة</span>
              </div>
            </div>

            <div className="bg-[#161a28] border border-zinc-800/80 rounded-2xl p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-zinc-400 mb-2">
                <span className="text-xs">الكثافة الشبكية</span>
                <Share2 size={16} className="text-indigo-400" />
              </div>
              <div>
                <span className="text-2xl font-bold text-indigo-400 font-mono">
                  {Math.round(stats.density * 100)}%
                </span>
                <span className="text-[10px] text-zinc-500 block mt-0.5">ترابط الأفكار</span>
              </div>
            </div>

            <div className="bg-[#161a28] border border-zinc-800/80 rounded-2xl p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-zinc-400 mb-2">
                <span className="text-xs">الملاحظات المنعزلة</span>
                <AlertCircle size={16} className="text-rose-400" />
              </div>
              <div>
                <span className="text-2xl font-bold text-rose-400 font-mono">
                  {stats.orphanCount}
                </span>
                <span className="text-[10px] text-zinc-500 block mt-0.5">تطفو خارج الدوامة</span>
              </div>
            </div>
          </div>

          {/* Vortex Gravitational Rings Breakdown */}
          <div className="bg-[#161a28]/80 border border-zinc-800/80 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2 mb-3">
              <Orbit size={16} className="text-violet-400" />
              طبقات الجاذبية المدارية في الدوامة
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              تتوزع الأفكار في مدارات حلزونية؛ تتركز في النواة الأفكار الأكثر ترابطاً وتنتشر
              الشرارات الجديدة في المدارات الخارجية.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {/* Core */}
              <div className="p-3.5 rounded-xl bg-violet-950/30 border border-violet-800/40">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-violet-300">النواة المركزية</span>
                  <span className="font-mono text-violet-400 font-bold">
                    {stats.gravityRings.core.count}
                  </span>
                </div>
                <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden mb-2">
                  <div
                    className="bg-violet-500 h-full rounded-full"
                    style={{
                      width: `${(stats.gravityRings.core.count / Math.max(1, stats.totalNotes)) * 100}%`,
                    }}
                  />
                </div>
                <div className="text-[11px] text-zinc-400 space-y-1">
                  {stats.gravityRings.core.notes.slice(0, 2).map((n) => (
                    <button
                      key={n.id}
                      onClick={() => {
                        onSelectNote(n.id);
                        onClose();
                      }}
                      className="text-left w-full truncate hover:text-violet-300 text-zinc-300 flex items-center gap-1"
                    >
                      <span className="w-1 h-1 rounded-full bg-violet-400" />
                      {n.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Inner */}
              <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-800/40">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-cyan-300">المدار النشط</span>
                  <span className="font-mono text-cyan-400 font-bold">
                    {stats.gravityRings.inner.count}
                  </span>
                </div>
                <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden mb-2">
                  <div
                    className="bg-cyan-500 h-full rounded-full"
                    style={{
                      width: `${(stats.gravityRings.inner.count / Math.max(1, stats.totalNotes)) * 100}%`,
                    }}
                  />
                </div>
                <div className="text-[11px] text-zinc-400 space-y-1">
                  {stats.gravityRings.inner.notes.slice(0, 2).map((n) => (
                    <button
                      key={n.id}
                      onClick={() => {
                        onSelectNote(n.id);
                        onClose();
                      }}
                      className="text-left w-full truncate hover:text-cyan-300 text-zinc-300 flex items-center gap-1"
                    >
                      <span className="w-1 h-1 rounded-full bg-cyan-400" />
                      {n.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Outer */}
              <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-800/30">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-amber-300">المدار الخارجي</span>
                  <span className="font-mono text-amber-400 font-bold">
                    {stats.gravityRings.outer.count}
                  </span>
                </div>
                <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden mb-2">
                  <div
                    className="bg-amber-500 h-full rounded-full"
                    style={{
                      width: `${(stats.gravityRings.outer.count / Math.max(1, stats.totalNotes)) * 100}%`,
                    }}
                  />
                </div>
                <div className="text-[11px] text-zinc-400 space-y-1">
                  {stats.gravityRings.outer.notes.slice(0, 2).map((n) => (
                    <button
                      key={n.id}
                      onClick={() => {
                        onSelectNote(n.id);
                        onClose();
                      }}
                      className="text-left w-full truncate hover:text-amber-300 text-zinc-300 flex items-center gap-1"
                    >
                      <span className="w-1 h-1 rounded-full bg-amber-400" />
                      {n.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Periphery / Orphans */}
              <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-800/30">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-rose-300">أطراف الدوامة (منعزلة)</span>
                  <span className="font-mono text-rose-400 font-bold">
                    {stats.gravityRings.periphery.count}
                  </span>
                </div>
                <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden mb-2">
                  <div
                    className="bg-rose-500 h-full rounded-full"
                    style={{
                      width: `${(stats.gravityRings.periphery.count / Math.max(1, stats.totalNotes)) * 100}%`,
                    }}
                  />
                </div>
                <div className="text-[11px] text-zinc-400 space-y-1">
                  {stats.gravityRings.periphery.notes.slice(0, 2).map((n) => (
                    <button
                      key={n.id}
                      onClick={() => {
                        onSelectNote(n.id);
                        onClose();
                      }}
                      className="text-left w-full truncate hover:text-rose-300 text-zinc-300 flex items-center gap-1"
                    >
                      <span className="w-1 h-1 rounded-full bg-rose-400" />
                      {n.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Two-Column Section: Top Hubs & Orphans */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Top Hub Notes */}
            <div className="bg-[#161a28]/80 border border-zinc-800/80 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2 mb-3">
                  <Sparkles size={16} className="text-violet-400" />
                  أقوى الملاحظات جذباً في قلب الدوامة
                </h3>
                <div className="space-y-2.5">
                  {stats.topConnected.slice(0, 5).map(({ note, count }, idx) => (
                    <div
                      key={note.id}
                      onClick={() => {
                        onSelectNote(note.id);
                        onClose();
                      }}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800/60 cursor-pointer transition-all group"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-mono font-bold w-5 h-5 rounded-lg bg-zinc-800 text-violet-400 flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-medium text-zinc-200 group-hover:text-violet-300 transition-colors">
                          {note.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-cyan-400 font-semibold">
                          {count} روابط
                        </span>
                        <ArrowLeft
                          size={14}
                          className="text-zinc-500 group-hover:text-zinc-200 group-hover:-translate-x-0.5 transition-transform"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Orphan Notes needing connection */}
            <div className="bg-[#161a28]/80 border border-zinc-800/80 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2 mb-3">
                  <AlertCircle size={16} className="text-rose-400" />
                  ملاحظات تسبح بلا روابط (تحتاج دمج)
                </h3>
                {stats.orphans.length === 0 ? (
                  <div className="p-6 text-center text-zinc-500 text-xs flex flex-col items-center gap-2">
                    <CheckCircle2 size={24} className="text-emerald-400" />
                    <span>جميع الملاحظات متصلة بالدوامة بنجاح! لا توجد أفكار تائهة.</span>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {stats.orphans.map((note) => (
                      <div
                        key={note.id}
                        onClick={() => {
                          onSelectNote(note.id);
                          onClose();
                        }}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800/60 cursor-pointer transition-all group"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-2 h-2 rounded-full bg-rose-400" />
                          <span className="text-xs font-medium text-zinc-200 group-hover:text-rose-300 transition-colors">
                            {note.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-rose-400 font-medium">
                          <span>فتح وربط</span>
                          <Link2 size={13} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tags & Folders Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Folders Distribution */}
            <div className="bg-[#161a28]/80 border border-zinc-800/80 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2 mb-3">
                <FolderTree size={16} className="text-cyan-400" />
                توزيع المجلدات والمحاور
              </h3>
              <div className="space-y-2.5">
                {stats.folderDistribution.map((item) => (
                  <div key={item.folder} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-300 flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        {item.folder}
                      </span>
                      <span className="text-zinc-400 font-mono">
                        {item.count} ({item.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-zinc-800/70 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${item.percentage}%`,
                          backgroundColor: item.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tags Cloud / Bars */}
            <div className="bg-[#161a28]/80 border border-zinc-800/80 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2 mb-3">
                <Hash size={16} className="text-amber-400" />
                الوسوم الأكثر تكراراً
              </h3>
              <div className="flex flex-wrap gap-2 pt-1">
                {stats.tagDistribution.map((item) => (
                  <span
                    key={item.tag}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-300 hover:border-violet-500/50 transition-colors"
                  >
                    <span className="text-violet-400">#</span>
                    {item.tag}
                    <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-zinc-800 text-zinc-400 font-mono">
                      {item.count}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Vault Maintenance & Backup Actions */}
          <div className="pt-3 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <button
                id="export-vault-btn"
                onClick={onExportVault}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 transition-colors border border-zinc-700/60"
              >
                <Download size={14} />
                تصدير الخزينة (JSON)
              </button>

              <label className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 transition-colors border border-zinc-700/60 cursor-pointer">
                <Upload size={14} />
                استيراد خزينة
                <input
                  type="file"
                  accept=".json"
                  onChange={onImportVault}
                  className="hidden"
                />
              </label>

              <button
                id="reset-vault-btn"
                onClick={onResetVault}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-rose-950/30 text-zinc-400 hover:text-rose-300 transition-colors border border-zinc-800"
                title="استعادة الملاحظات النموذجية الأولية"
              >
                <RotateCcw size={14} />
                إعادة ضبط الخزينة
              </button>
            </div>

            <span className="text-zinc-500 text-[11px]">
              يتم حفظ التغييرات محلياً وتحديثها فورياً في دوامة الأفكار
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
