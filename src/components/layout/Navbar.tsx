import React from 'react';
import {
  Menu,
  Orbit,
  BarChart3,
  Plus,
  Layout,
  Maximize2,
  Minimize2,
  Columns,
  FileText,
  Share2,
} from 'lucide-react';

export type MainLayoutMode = 'split' | 'editor-only' | 'vortex-only';

interface NavbarProps {
  layoutMode: MainLayoutMode;
  onChangeLayoutMode: (mode: MainLayoutMode) => void;
  onToggleSidebar: () => void;
  onOpenStats: () => void;
  onCreateNewNote: () => void;
  totalNotes: number;
  totalLinks: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  layoutMode,
  onChangeLayoutMode,
  onToggleSidebar,
  onOpenStats,
  onCreateNewNote,
  totalNotes,
  totalLinks,
}) => {
  return (
    <header
      id="app-navbar"
      className="h-14 bg-[#0e1017] border-b border-zinc-800/80 px-4 flex items-center justify-between z-30 select-none"
    >
      {/* Right side (RTL start): Sidebar toggle & Logo */}
      <div className="flex items-center gap-3">
        <button
          id="sidebar-mobile-toggle"
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors md:hidden"
          title="فتح القائمة الجانبية"
        >
          <Menu size={18} />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-violet-500/20">
            <Orbit size={18} className="animate-spin-slow" />
          </div>
          <div className="hidden sm:block">
            <div className="text-xs font-bold text-zinc-100 flex items-center gap-1.5">
              <span>دوامة أوبسيديان المعرفية</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                Vortex
              </span>
            </div>
            <div className="text-[10px] text-zinc-400 flex items-center gap-2">
              <span>{totalNotes} فكرة</span>
              <span>•</span>
              <span className="text-cyan-400">{totalLinks} روابط مدارية</span>
            </div>
          </div>
        </div>
      </div>

      {/* Center: Layout View Mode Switcher */}
      <div className="flex items-center bg-[#141724] border border-zinc-800 rounded-xl p-0.5 shadow-inner">
        <button
          id="layout-mode-vortex"
          onClick={() => onChangeLayoutMode('vortex-only')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            layoutMode === 'vortex-only'
              ? 'bg-violet-600 text-white shadow-md'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
          title="عرض الدوامة الفلكية كاملة"
        >
          <Orbit size={14} />
          <span className="hidden sm:inline">الدوامة</span>
        </button>

        <button
          id="layout-mode-split"
          onClick={() => onChangeLayoutMode('split')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hidden md:flex ${
            layoutMode === 'split'
              ? 'bg-violet-600 text-white shadow-md'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
          title="عرض مشترك: المحرر والدوامة معاً"
        >
          <Columns size={14} />
          <span>المحرر والدوامة</span>
        </button>

        <button
          id="layout-mode-editor"
          onClick={() => onChangeLayoutMode('editor-only')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            layoutMode === 'editor-only'
              ? 'bg-violet-600 text-white shadow-md'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
          title="عرض المحرر فقط"
        >
          <FileText size={14} />
          <span className="hidden sm:inline">المحرر</span>
        </button>
      </div>

      {/* Left side (RTL end): Stats & New Note */}
      <div className="flex items-center gap-2">
        <button
          id="navbar-stats-btn"
          onClick={onOpenStats}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 border border-zinc-800 text-xs font-medium transition-all"
          title="عرض لوحة الإحصائيات الشاملة"
        >
          <BarChart3 size={15} className="text-amber-400" />
          <span className="hidden sm:inline">الإحصائيات</span>
        </button>

        <button
          id="navbar-new-note-btn"
          onClick={onCreateNewNote}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium shadow-md shadow-violet-600/25 transition-all"
          title="إنشاء ملاحظة جديدة"
        >
          <Plus size={15} />
          <span className="hidden sm:inline">ملاحظة جديدة</span>
        </button>
      </div>
    </header>
  );
};
