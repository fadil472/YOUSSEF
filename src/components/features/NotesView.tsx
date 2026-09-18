import React, { useState, useMemo } from 'react';
import { Note, Folder } from '../../types';
import { extractWikiLinks, getInboundBacklinks, getOutboundLinks, countWords, estimateReadingTime } from '../../utils/vaultUtils';
import {
  FileText,
  Plus,
  ArrowLeft,
  Trash2,
  Tag,
  Clock,
  Eye,
  Edit3,
  Folder as FolderIcon,
  Pin,
  Link as LinkIcon,
  Orbit,
} from 'lucide-react';

interface NotesViewProps {
  notes: Note[];
  folders: Folder[];
  selectedNoteId: string | null;
  onSelectNote: (noteId: string | null) => void;
  onUpdateNote: (note: Note) => void;
  onCreateNote: (title: string, folderId?: string) => void;
  onDeleteNote: (noteId: string) => void;
}

export const NotesView: React.FC<NotesViewProps> = ({
  notes,
  folders,
  selectedNoteId,
  onSelectNote,
  onUpdateNote,
  onCreateNote,
  onDeleteNote,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [newNoteTitle, setNewNoteTitle] = useState<string>('');
  const [showNewModal, setShowNewModal] = useState<boolean>(false);
  const [selectedFolder, setSelectedFolder] = useState<string>('folder-daily');

  const activeNote = notes.find((n) => n.id === selectedNoteId) || null;

  // Calculate note stats
  const wordCount = useMemo(() => activeNote ? countWords(activeNote.content) : 0, [activeNote]);
  const readingTime = useMemo(() => estimateReadingTime(wordCount), [wordCount]);
  const backlinks = useMemo(() => activeNote ? getInboundBacklinks(activeNote, notes) : [], [activeNote, notes]);
  const outboundLinks = useMemo(() => activeNote ? getOutboundLinks(activeNote, notes) : [], [activeNote, notes]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim()) return;
    onCreateNote(newNoteTitle.trim(), selectedFolder);
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
          {/* Title & Metadata */}
          <div className="mb-4">
            <h1 className="text-xl font-bold text-zinc-100 mb-2">{activeNote.title}</h1>
            
            <div className="flex items-center gap-3 text-xs text-zinc-400 flex-wrap">
              <div className="flex items-center gap-1.5">
                <FolderIcon size={14} className="text-zinc-500" />
                <span>{folders.find(f => f.id === activeNote.folder)?.name || 'غير مصنف'}</span>
              </div>
              
              <span className="flex items-center gap-1">
                <Clock size={13} />
                {readingTime} د قراءة ({wordCount} كلمة)
              </span>
              
              <span className="flex items-center gap-1 text-violet-400 bg-violet-950/40 px-2 py-0.5 rounded-full border border-violet-800/40">
                <Orbit size={12} />
                {backlinks.length + outboundLinks.length} روابط
              </span>
            </div>
          </div>

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

          {/* Links Section */}
          {(backlinks.length > 0 || outboundLinks.length > 0) && (
            <div className="mb-4 p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/60">
              <div className="flex items-center gap-2 mb-2">
                <LinkIcon size={14} className="text-violet-400" />
                <span className="text-xs font-semibold text-zinc-300">الروابط الدوامية</span>
              </div>
              
              {backlinks.length > 0 && (
                <div className="mb-2">
                  <span className="text-[10px] text-zinc-500">← تشير إليها:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {backlinks.map(note => (
                      <button
                        key={note.id}
                        onClick={() => onSelectNote(note.id)}
                        className="text-[10px] px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30 hover:bg-violet-500/30 transition-colors"
                      >
                        {note.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {outboundLinks.length > 0 && (
                <div>
                  <span className="text-[10px] text-zinc-500">تشير إلى:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {outboundLinks.map(note => (
                      <button
                        key={note.id}
                        onClick={() => onSelectNote(note.id)}
                        className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30 transition-colors"
                      >
                        {note.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

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
            onClick={() => onSelectNote(note.id)}
            className="p-3.5 rounded-2xl bg-[#131622] border border-zinc-800/80 hover:border-zinc-700 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {note.pinned && <Pin size={12} className="text-amber-400" />}
                <h3 className="text-sm font-semibold text-zinc-200">{note.title}</h3>
              </div>
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
              {note.tags.slice(0, 3).map((t) => (
                <span
                  key={t}
                  className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 font-mono"
                >
                  #{t}
                </span>
              ))}
              {note.tags.length > 3 && (
                <span className="text-[10px] text-zinc-500">+{note.tags.length - 3}</span>
              )}
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
            
            <div>
              <label className="text-[10px] text-zinc-400 mb-1 block">المجلد</label>
              <select
                value={selectedFolder}
                onChange={(e) => setSelectedFolder(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-violet-500"
              >
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
            
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
