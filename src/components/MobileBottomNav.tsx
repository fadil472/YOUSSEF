import React from 'react';
import {
  RotateCcw,
  BarChart3,
  Calendar,
  BookOpen,
} from 'lucide-react';

export type MobileTab = 'today' | 'stats' | 'calendar' | 'plan';

interface MobileBottomNavProps {
  activeTab: MobileTab;
  onChangeTab: (tab: MobileTab) => void;
  pendingCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onChangeTab,
  pendingCount,
}) => {
  return (
    <nav
      id="mobile-bottom-nav"
      className="absolute bottom-0 inset-x-0 h-16 bg-[#11131c]/95 backdrop-blur-xl border-t border-zinc-800/80 px-4 flex items-center justify-around z-30 select-none shadow-2xl"
    >
      {/* 1. Today Tasks Tab */}
      <button
        id="nav-tab-today"
        onClick={() => onChangeTab('today')}
        className={`flex flex-col items-center justify-center gap-1 transition-all relative ${
          activeTab === 'today' ? 'text-violet-400 font-bold' : 'text-zinc-400 hover:text-zinc-200'
        }`}
      >
        <div className="relative">
          <RotateCcw size={20} className={activeTab === 'today' ? 'animate-spin-slow' : ''} />
          {pendingCount > 0 && (
            <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-amber-500 text-black text-[9px] font-bold flex items-center justify-center">
              {pendingCount}
            </span>
          )}
        </div>
        <span className="text-[10px]">دوامة اليوم</span>
      </button>

      {/* 2. Stats & Charts Tab */}
      <button
        id="nav-tab-stats"
        onClick={() => onChangeTab('stats')}
        className={`flex flex-col items-center justify-center gap-1 transition-all ${
          activeTab === 'stats' ? 'text-violet-400 font-bold' : 'text-zinc-400 hover:text-zinc-200'
        }`}
      >
        <BarChart3 size={20} />
        <span className="text-[10px]">المبيانات</span>
      </button>

      {/* 3. Calendar History Log Tab */}
      <button
        id="nav-tab-calendar"
        onClick={() => onChangeTab('calendar')}
        className={`flex flex-col items-center justify-center gap-1 transition-all ${
          activeTab === 'calendar' ? 'text-violet-400 font-bold' : 'text-zinc-400 hover:text-zinc-200'
        }`}
      >
        <Calendar size={20} />
        <span className="text-[10px]">السجل</span>
      </button>

      {/* 4. Plan Tab */}
      <button
        id="nav-tab-plan"
        onClick={() => onChangeTab('plan')}
        className={`flex flex-col items-center justify-center gap-1 transition-all ${
          activeTab === 'plan' ? 'text-violet-400 font-bold' : 'text-zinc-400 hover:text-zinc-200'
        }`}
      >
        <BookOpen size={20} />
        <span className="text-[10px]">الخطة</span>
      </button>
    </nav>
  );
};
