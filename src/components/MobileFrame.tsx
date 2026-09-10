import React, { useState } from 'react';
import { Smartphone, Maximize2, Battery, Wifi, Signal } from 'lucide-react';

interface MobileFrameProps {
  children: React.ReactNode;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({ children }) => {
  const [isFullWidth, setIsFullWidth] = useState<boolean>(false);

  return (
    <div className="min-h-screen w-full bg-[#08090d] flex flex-col items-center justify-center sm:p-4 selection:bg-violet-500/30">
      {/* Top Mobile Frame Mode Switcher (Visible on desktop/tablet) */}
      <div className="hidden sm:flex items-center justify-between w-full max-w-md mb-2 px-2 text-xs text-zinc-400">
        <span className="flex items-center gap-1.5 font-medium text-zinc-300">
          <Smartphone size={14} className="text-violet-400" />
          معاينة تطبيق الهاتف (Mobile App)
        </span>
        <button
          id="toggle-mobile-frame-btn"
          onClick={() => setIsFullWidth(!isFullWidth)}
          className="flex items-center gap-1 hover:text-zinc-200 bg-zinc-900/80 px-2.5 py-1 rounded-lg border border-zinc-800 transition-colors"
        >
          <Maximize2 size={12} />
          <span>{isFullWidth ? 'وضع إطار الهاتف' : 'ملء الشاشة'}</span>
        </button>
      </div>

      {/* Phone Mockup or Full Width Container */}
      <div
        className={`w-full bg-[#0f1118] text-zinc-100 flex flex-col overflow-hidden relative transition-all duration-300 ${
          isFullWidth
            ? 'h-screen max-w-none'
            : 'sm:max-w-[420px] sm:h-[860px] sm:rounded-[42px] sm:border-[8px] sm:border-zinc-800 sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_40px_rgba(139,92,246,0.15)] h-screen'
        }`}
      >
        {/* Phone Status Bar */}
        <div className="h-10 px-6 pt-2 pb-1 flex items-center justify-between text-xs text-zinc-400 z-30 select-none bg-[#0f1118]/80 backdrop-blur-sm border-b border-zinc-900/60">
          <span className="font-semibold text-xs tracking-wider text-zinc-300 font-mono">
            {new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
          </span>

          {/* Dynamic Island / Speaker Pill */}
          <div className="w-20 h-4 bg-black/70 rounded-full flex items-center justify-center border border-zinc-800/40">
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-900 mr-2" />
          </div>

          <div className="flex items-center gap-2">
            <Signal size={12} />
            <Wifi size={12} />
            <Battery size={13} className="text-emerald-400" />
          </div>
        </div>

        {/* Inner App Content */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {children}
        </div>

        {/* Mobile Home Indicator Pill */}
        <div className="h-4 w-full flex items-center justify-center bg-[#0f1118] pb-1 select-none pointer-events-none">
          <div className="w-32 h-1 bg-zinc-700/60 rounded-full" />
        </div>
      </div>
    </div>
  );
};
