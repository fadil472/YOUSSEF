import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Download,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  Zap,
  Info,
  Layers,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallModal: React.FC<InstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);

  if (!isOpen) return null;

  // The public live URL of this application
  const appUrl = window.location.href.split('?')[0].replace(/\/+$/, '');
  const pwaBuilderUrl = `https://www.pwabuilder.com/reportcard?site=${encodeURIComponent(appUrl)}`;

  const handleCopyAppUrl = async () => {
    try {
      await navigator.clipboard.writeText(appUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2500);
    } catch {
      alert('تم نسخ الرابط!');
    }
  };

  const handleDirectInstall = async () => {
    const success = await install();
    if (success) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="bg-[#121422] border border-zinc-800 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl text-right flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-zinc-800/80 flex items-center justify-between bg-[#141727]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/30">
              <Smartphone size={18} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-bold text-zinc-100">تثبيت التطبيق (Android APK)</h2>
                <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
                  .apk
                </span>
              </div>
              <p className="text-[10px] text-zinc-400">تشغيل التطبيق على الهاتف بدون متصفح</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Method 1: WebAPK direct install (Best for Android) */}
          <div className="bg-gradient-to-b from-emerald-950/30 to-zinc-900/60 border border-emerald-500/30 rounded-2xl p-3.5 space-y-2.5 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-emerald-400 block">
                  الطريقة المباشرة (WebAPK)
                </span>
                <h3 className="text-xs font-bold text-zinc-100 mt-0.5">
                  تثبيت كحزمة أندرويد رسمية فوراً
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-medium border border-emerald-500/30 flex items-center gap-1">
                <Zap size={10} />
                <span>موصى به</span>
              </span>
            </div>

            <p className="text-[11px] text-zinc-300 leading-relaxed">
              يقوم نظام أندرويد تلقائياً بتوليد حزمة <strong>WebAPK</strong> كاملة وتثبيتها بين تطبيقاتك بأيقونة مستقلة وشاشة بداية، وتعمل بكامل الشاشة دون شريط المتصفح وبدون أي تحذيرات أمان.
            </p>

            {isInstallable ? (
              <button
                id="btn-direct-install-apk"
                onClick={handleDirectInstall}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all active:scale-98"
              >
                <Download size={15} />
                <span>تثبيت التطبيق على الهاتف الآن (WebAPK)</span>
              </button>
            ) : isInstalled ? (
              <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-[11px] flex items-center gap-2 font-medium">
                <ShieldCheck size={16} />
                <span>التطبيق مثبت ويعمل حالياً كتطبيق هاتف مستقل!</span>
              </div>
            ) : (
              <div className="bg-zinc-950/60 rounded-xl p-2.5 border border-zinc-800 space-y-1.5 text-[11px] text-zinc-300">
                <div className="font-semibold text-zinc-200 flex items-center gap-1.5">
                  <span>📱 خطوات التثبيت من متصفح Chrome:</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-[10px] text-zinc-400">
                  <li>اضغط على زر الخيارات (الثلاث نقاط ⋮) أعلى يمين المتصفح.</li>
                  <li>اختر <strong>«تثبيت التطبيق» (Install app)</strong> أو <strong>«إضافة إلى الشاشة الرئيسية»</strong>.</li>
                  <li>سيقوم الهاتف ببناء حزمة الـ APK وتثبيتها في قائمة تطبيقاتك.</li>
                </ol>
              </div>
            )}
          </div>

          {/* Method 2: Convert to Standalone .APK via PWABuilder */}
          <div className="bg-[#171a2b] border border-zinc-800 rounded-2xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-semibold text-cyan-400 block">
                  ملف APK مستقل (.apk / .aab)
                </span>
                <h3 className="text-xs font-bold text-zinc-100 mt-0.5">
                  تنزيل ملف .APK عبر PWABuilder
                </h3>
              </div>
              <span className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                <Layers size={15} />
              </span>
            </div>

            <p className="text-[11px] text-zinc-400 leading-relaxed">
              إذا كنت بحاجة إلى ملف <code className="text-cyan-300 font-mono text-[10px]">.apk</code> جاهز لنقله بالبلوتوث أو الرفع لمتجر Google Play، يمكنك استخدام أداة <strong>PWABuilder</strong> الرسمية من مايكروسوفت:
            </p>

            <a
              id="open-pwabuilder-link"
              href={pwaBuilderUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-cyan-500/30 text-cyan-300 font-semibold text-[11px] flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <span>فتح موقع تحويل APK (PWABuilder)</span>
              <ExternalLink size={14} />
            </a>

            {/* Copy Link Button */}
            <div className="pt-1 flex items-center justify-between gap-2 bg-zinc-950/80 p-2 rounded-xl border border-zinc-800/80">
              <span className="text-[10px] text-zinc-400 truncate max-w-[200px] font-mono ltr text-left">
                {appUrl}
              </span>
              <button
                onClick={handleCopyAppUrl}
                className="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] flex items-center gap-1 font-medium flex-shrink-0 transition-colors"
              >
                {copiedUrl ? (
                  <>
                    <Check size={12} className="text-emerald-400" />
                    <span className="text-emerald-400">تم النسخ</span>
                  </>
                ) : (
                  <>
                    <Copy size={12} />
                    <span>نسخ الرابط</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* iOS Note if on Apple device */}
          {isIOS && (
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-3 space-y-1.5 text-[10px] text-zinc-400">
              <div className="font-semibold text-zinc-200 flex items-center gap-1.5">
                <Info size={13} className="text-amber-400" />
                <span>لمستخدمي هواتف iPhone (Safari):</span>
              </div>
              <p>
                اضغط على زر <strong>المشاركة (⎋)</strong> في أسفل متصفح Safari، ثم اختر <strong>«إضافة إلى الصفحة الرئيسية»</strong>.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-zinc-800/80 bg-[#141727] flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
            <ShieldCheck size={13} className="text-emerald-400" />
            <span>يعمل بدون إنترنت (Offline) بنسبة 100%</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
