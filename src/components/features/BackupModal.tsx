import React, { useState, useRef } from 'react';
import { RecurringTask, ObsidianNote } from '../../types';
import { formatDate } from '../../data/starterData';
import {
  X,
  Download,
  Upload,
  Copy,
  Check,
  FileJson,
  AlertCircle,
  CheckCircle2,
  Database,
  RotateCcw,
  FileText,
  Repeat,
  Info,
} from 'lucide-react';

export interface BackupData {
  version: number;
  appName: string;
  exportDate: string;
  tasksCount: number;
  notesCount: number;
  tasks: RecurringTask[];
  notes: ObsidianNote[];
}

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: RecurringTask[];
  notes: ObsidianNote[];
  onImportData: (data: { tasks: RecurringTask[]; notes: ObsidianNote[] }, mode: 'replace' | 'merge') => void;
  onResetToDefaults: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  tasks,
  notes,
  onImportData,
  onResetToDefaults,
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [copied, setCopied] = useState<boolean>(false);
  const [importStatus, setImportStatus] = useState<{
    success?: boolean;
    message: string;
    parsed?: { tasks: RecurringTask[]; notes: ObsidianNote[]; exportDate?: string };
  } | null>(null);
  const [importMode, setImportMode] = useState<'replace' | 'merge'>('replace');
  const [pastedJson, setPastedJson] = useState<string>('');
  const [showPasteBox, setShowPasteBox] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Prepare backup JSON object
  const getBackupObject = (): BackupData => {
    return {
      version: 2,
      appName: 'Obsidian Vortex Notes & Habits',
      exportDate: new Date().toISOString(),
      tasksCount: tasks.length,
      notesCount: notes.length,
      tasks,
      notes,
    };
  };

  const backupJsonString = JSON.stringify(getBackupObject(), null, 2);

  // 1. Download JSON file
  const handleDownloadBackup = () => {
    const todayStr = formatDate(new Date());
    const blob = new Blob([backupJsonString], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `obsidian-vortex-backup-${todayStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 2. Copy JSON string to clipboard (convenient on mobile)
  const handleCopyClipboard = async () => {
    try {
      await navigator.clipboard.writeText(backupJsonString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      alert('تعذر النسخ التلقائي، يمكنك تحميل الملف مباشرة.');
    }
  };

  // Process and validate imported JSON
  const validateAndParseJson = (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);

      // Support our standard format or raw arrays
      let loadedTasks: RecurringTask[] = [];
      let loadedNotes: ObsidianNote[] = [];
      let exportDate = parsed.exportDate;

      if (parsed && typeof parsed === 'object') {
        if (Array.isArray(parsed.tasks)) {
          loadedTasks = parsed.tasks;
        }
        if (Array.isArray(parsed.notes)) {
          loadedNotes = parsed.notes;
        }
        // If raw array of tasks was imported directly
        if (Array.isArray(parsed) && parsed.length > 0) {
          if (parsed[0].title && parsed[0].recurrence) {
            loadedTasks = parsed;
          } else if (parsed[0].title && parsed[0].content) {
            loadedNotes = parsed;
          }
        }
      }

      if (loadedTasks.length === 0 && loadedNotes.length === 0) {
        setImportStatus({
          success: false,
          message: 'الملف لا يحتوي على بيانات مهام أو ملاحظات صالحة.',
        });
        return;
      }

      setImportStatus({
        success: true,
        message: `تم التعرف على ${loadedTasks.length} مهمة و ${loadedNotes.length} ملاحظة بنجاح!`,
        parsed: {
          tasks: loadedTasks,
          notes: loadedNotes,
          exportDate,
        },
      });
    } catch (err) {
      setImportStatus({
        success: false,
        message: 'صيغة الملف غير صالحة. يرجى التأكد من اختيار ملف JSON صحيح.',
      });
    }
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      validateAndParseJson(text);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Confirm and apply import
  const handleApplyImport = () => {
    if (!importStatus?.parsed) return;
    onImportData(
      {
        tasks: importStatus.parsed.tasks,
        notes: importStatus.parsed.notes,
      },
      importMode
    );
    alert('تم استعادة النسخة الاحتياطية بنجاح!');
    onClose();
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
        {/* Modal Header */}
        <div className="p-4 border-b border-zinc-800/80 flex items-center justify-between bg-[#141727]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <Database size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-100">النسخ الاحتياطي (JSON)</h2>
              <p className="text-[10px] text-zinc-400">حفظ واستعادة مهامك وملاحظاتك بأمان</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-2 gap-1.5 bg-zinc-950/60 border-b border-zinc-800/60 text-xs">
          <button
            onClick={() => {
              setActiveTab('export');
              setImportStatus(null);
            }}
            className={`flex-1 py-1.5 rounded-xl font-medium flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'export'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Download size={14} />
            <span>تصدير نسخة احتياطية</span>
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`flex-1 py-1.5 rounded-xl font-medium flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'import'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Upload size={14} />
            <span>استيراد واستعادة</span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* TAB 1: EXPORT */}
          {activeTab === 'export' && (
            <div className="space-y-3.5">
              {/* Data Summary Card */}
              <div className="bg-[#171a2b] border border-zinc-800/80 rounded-2xl p-3.5 space-y-2.5">
                <span className="text-[11px] font-semibold text-zinc-300 block">
                  محتويات النسخة الاحتياطية الحالية:
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-zinc-900/80 p-2.5 rounded-xl border border-zinc-800 flex items-center gap-2">
                    <Repeat size={15} className="text-cyan-400" />
                    <div>
                      <span className="text-[10px] text-zinc-400 block">المهام المتكررة</span>
                      <span className="font-bold text-zinc-100 font-mono">{tasks.length} مهام</span>
                    </div>
                  </div>
                  <div className="bg-zinc-900/80 p-2.5 rounded-xl border border-zinc-800 flex items-center gap-2">
                    <FileText size={15} className="text-violet-400" />
                    <div>
                      <span className="text-[10px] text-zinc-400 block">ملاحظات أوبسيديان</span>
                      <span className="font-bold text-zinc-100 font-mono">{notes.length} ملاحظة</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 pt-1">
                  <Info size={12} className="text-violet-400 flex-shrink-0" />
                  <span>
                    يشمل التصدير جميع سجلات الأيام والالتزام، العادات، والملاحظات الذرية.
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  id="btn-download-json-backup"
                  onClick={handleDownloadBackup}
                  className="w-full py-2.5 px-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-violet-600/30 transition-all active:scale-98"
                >
                  <Download size={15} />
                  <span>تحميل ملف النسخة الاحتياطية (JSON)</span>
                </button>

                <button
                  id="btn-copy-json-clipboard"
                  onClick={handleCopyClipboard}
                  className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-200 font-medium text-xs flex items-center justify-center gap-2 transition-all"
                >
                  {copied ? (
                    <>
                      <Check size={15} className="text-emerald-400" />
                      <span className="text-emerald-400 font-semibold">تم نسخ بيانات JSON للحافظة!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={15} className="text-zinc-400" />
                      <span>نسخ كود JSON للحافظة (مفيد للهواتف)</span>
                    </>
                  )}
                </button>
              </div>

              {/* Reset to defaults warning */}
              <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-zinc-300 block">إعادة ضبط المصنع</span>
                  <span className="text-[10px] text-zinc-500">استعادة البيانات النموذجية الافتراضية</span>
                </div>
                <button
                  onClick={() => {
                    if (window.confirm('هل تريد بالتأكيد استعادة المهام والملاحظات الافتراضية؟')) {
                      onResetToDefaults();
                      onClose();
                    }
                  }}
                  className="px-2.5 py-1.5 rounded-lg border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-[11px] font-medium transition-colors"
                >
                  إعادة ضبط
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: IMPORT */}
          {activeTab === 'import' && (
            <div className="space-y-3.5">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json,application/json"
                className="hidden"
              />

              {/* Upload Dropzone / Button */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-zinc-700/80 hover:border-violet-500/60 rounded-2xl p-5 text-center bg-zinc-900/40 hover:bg-zinc-900/70 transition-all cursor-pointer space-y-2"
              >
                <div className="w-10 h-10 rounded-full bg-violet-600/20 text-violet-400 flex items-center justify-center mx-auto">
                  <Upload size={18} />
                </div>
                <h3 className="text-xs font-bold text-zinc-200">اختر ملف نسخة احتياطية (.json)</h3>
                <p className="text-[10px] text-zinc-500">انقر هنا لتحديد الملف من ذاكرة الهاتف</p>
              </div>

              {/* Or Paste JSON Toggle */}
              <div>
                <button
                  onClick={() => setShowPasteBox(!showPasteBox)}
                  className="text-[11px] text-violet-400 hover:underline flex items-center gap-1 font-medium"
                >
                  <FileJson size={13} />
                  <span>{showPasteBox ? 'إخفاء لصق النص' : 'أو لصق نص JSON يدوياً'}</span>
                </button>

                {showPasteBox && (
                  <div className="mt-2 space-y-2">
                    <textarea
                      value={pastedJson}
                      onChange={(e) => setPastedJson(e.target.value)}
                      placeholder='الصق نص الـ JSON هنا { "tasks": [...], "notes": [...] }'
                      className="w-full h-24 bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-xs font-mono text-zinc-300 focus:outline-none focus:border-violet-500"
                    />
                    <button
                      onClick={() => validateAndParseJson(pastedJson)}
                      className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-200 w-full"
                    >
                      فحص والتحقق من النص الملصوق
                    </button>
                  </div>
                )}
              </div>

              {/* Validation Feedback */}
              {importStatus && (
                <div
                  className={`p-3 rounded-xl border text-xs space-y-2 ${
                    importStatus.success
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-950/20 border-rose-500/30 text-rose-300'
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold">
                    {importStatus.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                    <span>{importStatus.message}</span>
                  </div>

                  {importStatus.success && importStatus.parsed && (
                    <div className="space-y-2 pt-2 border-t border-emerald-500/20 text-zinc-300">
                      <div className="text-[11px] space-y-1 font-mono">
                        <div>• المهام الجاهزة للاستعادة: {importStatus.parsed.tasks.length}</div>
                        <div>• الملاحظات الجاهزة للاستعادة: {importStatus.parsed.notes.length}</div>
                        {importStatus.parsed.exportDate && (
                          <div className="text-[10px] text-zinc-400">
                            تاريخ النسخة: {new Date(importStatus.parsed.exportDate).toLocaleDateString('ar-EG')}
                          </div>
                        )}
                      </div>

                      {/* Import Mode: Replace or Merge */}
                      <div className="pt-2 border-t border-emerald-500/20 space-y-1.5">
                        <span className="text-[11px] font-semibold block text-zinc-200">
                          طريقة الاستعادة:
                        </span>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => setImportMode('replace')}
                            className={`p-2 rounded-lg text-center border text-[10px] font-medium transition-all ${
                              importMode === 'replace'
                                ? 'bg-emerald-600 text-white border-emerald-400 shadow-sm'
                                : 'bg-zinc-900 border-zinc-700 text-zinc-400'
                            }`}
                          >
                            استبدال البيانات الحالية
                          </button>
                          <button
                            onClick={() => setImportMode('merge')}
                            className={`p-2 rounded-lg text-center border text-[10px] font-medium transition-all ${
                              importMode === 'merge'
                                ? 'bg-emerald-600 text-white border-emerald-400 shadow-sm'
                                : 'bg-zinc-900 border-zinc-700 text-zinc-400'
                            }`}
                          >
                            دمج مع البيانات الحالية
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={handleApplyImport}
                        className="w-full mt-2 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs shadow-md shadow-emerald-500/20 transition-all active:scale-98"
                      >
                        تأكيد استعادة النسخة الاحتياطية الآن
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
