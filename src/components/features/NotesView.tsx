import React, { useState } from 'react';
import { ObsidianNote } from '../../types';
import {
  FileText,
  Plus,
  ArrowLeft,
  Trash2,
  Tag,
  Clock,
  Eye,
  Edit3,
} from 'lucide-react';

interface NotesViewProps {
  notes: ObsidianNote[];
  selectedNoteTitle: string | null;
  onSelectNote: (noteTitle: string | null) => void;
  onUpdateNote: (note: ObsidianNote) => void;
  onCreateNote: (title: string) => void;
  onDeleteNote: (noteId: string) => void;
}

export const NotesView: React.FC<NotesViewProps> = ({
  notes,
  selectedNoteTitle,
  onSelectNote,
  onUpdateNote,
  onCreateNote,
  onDeleteNote,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [newNoteTitle, setNewNoteTitle] = useState<string>('');
  const [showNewModal, setShowNewModal] = useState<boolean>(false);

  const activeNote = notes.find((n) => n.title === selectedNoteTitle) || null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim()) return;
    onCreateNote(newNoteTitle.trim());
    setNewNoteTitle('');
    setShowNewModal(false);
  };

  // Note Reader / Editor View
  if (activeNote) {
    return (
      <div className="flex-1 flex flex-col bg-[#0f1118] overflow-hidden pb-20 select-none">
        {/* Note Top Bar */}
        <div className="p-4 border-b border-zinc-800/80 flex items-center justify-between bg-[#131622]">
          <button
            onClick={() => onSelectNote(null)}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>العودة للملاحظات</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                isEditing
                  ? 'bg-violet-600 text-white'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              {isEditing ? <Eye size={13} /> : <Edit3 size={13} />}
              <span>{isEditing ? 'معاينة' : 'تحرير'}</span>
            </button>

            <button
              onClick={() => {
                if (window.confirm('هل أنت متأكد من حذف هذه الملاحظة؟')) {
                  onDeleteNote(activeNote.id);
                  onSelectNote(null);
                }
              }}
              className="p-1.5 text-zinc-500 hover:text-rose-400 rounded-lg hover:bg-zinc-800 transition-colors"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        {/* Note Body */}
        <div className="flex-1 p-4 overflow-y-auto">
          {/* Title */}
          <h1 className="text-xl font-bold text-zinc-100 mb-2">{activeNote.title}</h1>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {activeNote.tags.map((t) => (
              <span
                key={t}
                className="text-[11px] px-2 py-0.5 rounded-md bg-zinc-800 text-violet-300 border border-zinc-700/60"
              >
                #{t}
              </span>
            ))}
          </div>

          {/* Editor or Preview */}
          {isEditing ? (
            <textarea
              value={activeNote.content}
              onChange={(e) =>
                onUpdateNote({
                  ...activeNote,
                  content: e.target.value,
                  updatedAt: Date.now(),
                })
              }
              className="w-full h-96 bg-zinc-950/60 border border-zinc-800 rounded-xl p-3 text-zinc-200 text-sm font-mono leading-relaxed focus:outline-none focus:border-violet-500/60 resize-none"
            />
          ) : (
            <div className="prose prose-invert prose-sm max-w-none text-zinc-300 whitespace-pre-wrap leading-relaxed">
              {activeNote.content}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Notes List View
  return (
    <div className="flex-1 flex flex-col bg-[#0f1118] overflow-y-auto p-4 pb-24 select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-[11px] font-semibold text-violet-400 flex items-center gap-1">
            <FileText size={13} />
            مستودع أوبسيديان
          </span>
          <h1 className="text-xl font-bold text-zinc-100 mt-0.5">ملاحظات العادات والمهام</h1>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="w-9 h-9 rounded-xl bg-violet-600 hover:bg-violet-500 text-white flex items-center justify-center shadow-lg shadow-violet-600/30 transition-all active:scale-95"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* Notes List */}
      <div className="space-y-2.5">
        {notes.map((note) => (
          <div
            key={note.id}
            onClick={() => onSelectNote(note.title)}
            className="p-3.5 rounded-2xl bg-[#131622] border border-zinc-800/80 hover:border-zinc-700 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-zinc-200">{note.title}</h3>
              <span className="text-[10px] text-zinc-500 font-mono">
                {new Date(note.updatedAt).toLocaleDateString('ar-EG')}
              </span>
            </div>

            <p className="text-xs text-zinc-400 line-clamp-2 mt-1.5 leading-relaxed">
              {note.content
                .replace(/#+\s+/g, '')
                .replace(/\[\[|\]\]/g, '')
                .slice(0, 100)}
            </p>

            <div className="flex items-center gap-1.5 mt-3 flex-wrap">
              {note.tags.map((t) => (
                <span
                  key={t}
                  className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 font-mono"
                >
                  #{t}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Create Note Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <form
            onSubmit={handleCreate}
            className="bg-[#141724] border border-zinc-800 rounded-2xl p-5 w-full max-w-xs space-y-4 shadow-2xl text-right"
          >
            <h3 className="text-sm font-bold text-zinc-100">إنشاء ملاحظة أوبسيديان جديدة</h3>
            <input
              type="text"
              value={newNoteTitle}
              onChange={(e) => setNewNoteTitle(e.target.value)}
              placeholder="عنوان الملاحظة..."
              autoFocus
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-violet-500"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:bg-zinc-800"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg text-xs bg-violet-600 text-white font-medium hover:bg-violet-500"
              >
                إنشاء
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
