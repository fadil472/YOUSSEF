import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-xl bg-amber-600/90 backdrop-blur-md border border-amber-400/40 px-3 py-1.5 text-[11px] font-medium text-white shadow-xl">
      <WifiOff size={14} className="animate-pulse" />
      <span>وضع عدم الاتصال — البيانات محفوظة محلياً بالكامل</span>
    </div>
  );
};
