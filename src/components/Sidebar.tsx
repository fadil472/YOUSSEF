import React, { useState, useMemo } from 'react';
import { Note, Folder } from '../types';
import {
  Search,
  Plus,
  Orbit,
  BarChart3,
  Pin,
  Folder as FolderIcon,
  Hash,
  FileText,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Layers,
  X,
} from 'lucide-react';

interface SidebarProps {
  notes: Note[];
  folders: Folder[];
  activeNoteId: string | null;
  onSelectNote: (noteId: string) => void;
  onCreateNewNote: () => void;
  onOpenStats: () => void;
  onToggleVortexView: () => void;
  isVortexActive: boolean;
  isOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  notes,
  folders,
  activeNoteId,
  onSelectNote,
  onCreateNewNote,
  onOpenStats,
  onToggleVortexView,
  isVortexActive,
  isOpen,
  onCloseMobile,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showPinnedOnly, setShowPinnedOnly] = useState<boolean>(false);
  const [foldersOpen, setFoldersOpen] = useState<boolean>(true);
  const [tagsOpen, setTagsOpen] = useState<boolean>(true);

  // Extract all unique tags
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    notes.forEach((n) => {
      n.tags.forEach((t) => tagsSet.add(t));
    });
    return Array.from(tagsSet).sort();
  }, [notes]);

  // Filter notes
  const filteredNotes = useMemo(() => {
    return notes.filter((n) => {
      // Pinned filter
      if (showPinnedOnly && !n.pinned) return false;

      // Folder filter
      if (selectedFolder && n.folder !== selectedFolder) return false;

      // Tag filter
      if (selectedTag && !n.tags.includes(selectedTag)) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = n.title.toLowerCase().includes(q);
        const matchesContent = n.content.toLowerCase().includes(q);
        const matchesTag = n.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesContent && !matchesTag) return false;
      }

      return true;
    });
  }, [notes, showPinnedOnly, selectedFolder, selectedTag, searchQuery]);

  return (
    <aside
      id="app-sidebar"
      className={`fixed inset-y-0 right-0 z-40 w-72 bg-[#0e1017] border-l border-zinc-800/80 flex flex-col transition-transform duration-300 md:relative md:translate-x-0 ${
        isOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
      }`}
    >
      {/* Brand Header */}
      <div className="p-4 border-b border-zinc-800/80 flex items-center justify-between bg-[#121420]/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-violet-500/20">
            <Orbit size={18} />
          </div>
          <div>
            <h1 className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
              دوامة أوبسيديان
              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
                Vortex
              </span>
            </h1>
            <p className="text-[11px] text-zinc-400">شبكة أفكار فلكية</p>
          </div>
        </div>

        <button
          onClick={onCloseMobile}
          className="md:hidden p-1.5 text-zinc-400 hover:text-zinc-100 rounded-lg hover:bg-zinc-800"
        >
          <X size={18} />
        </button>
      </div>

      {/* Main Action Buttons */}
      <div className="p-3 space-y-2 border-b border-zinc-800/80">
        <button
          id="new-note-sidebar-btn"
          onClick={onCreateNewNote}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium text-xs shadow-lg shadow-violet-600/25 transition-all"
        >
          <Plus size={16} />
          <span>ملاحظة جديدة</span>
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            id="sidebar-vortex-btn"
            onClick={onToggleVortexView}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-xl border text-xs font-medium transition-all ${
              isVortexActive
                ? 'bg-gradient-to-r from-violet-600/30 to-cyan-600/30 text-violet-300 border-violet-500/50'
                : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 border-zinc-800'
            }`}
          >
            <Orbit size={14} className={isVortexActive ? 'text-cyan-400' : ''} />
            <span>الدوامة</span>
          </button>

          <button
            id="sidebar-stats-btn"
            onClick={onOpenStats}
            className="flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-medium transition-all"
          >
            <BarChart3 size={14} className="text-amber-400" />
            <span>الإحصائيات</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-3 pt-3">
        <div className="relative">
          <Search
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500"
          />
          <input
            id="search-notes-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث في العناوين والنصوص..."
            className="w-full bg-zinc-900/90 text-xs text-zinc-200 placeholder:text-zinc-500 rounded-xl pr-9 pl-3 py-2 border border-zinc-800 focus:outline-none focus:border-violet-500/50 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-200"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Categories / Navigation list */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {/* Folders Section */}
        <div>
          <button
            onClick={() => setFoldersOpen(!foldersOpen)}
            className="w-full flex items-center justify-between text-xs font-semibold text-zinc-400 px-1 py-1 hover:text-zinc-200 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <FolderIcon size={13} className="text-violet-400" />
              المحاور والمجلدات
            </span>
            {foldersOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>

          {foldersOpen && (
            <div className="mt-1 space-y-0.5">
              <button
                onClick={() => {
                  setSelectedFolder(null);
                  setSelectedTag(null);
                  setShowPinnedOnly(false);
                }}
                className={`w-full text-right px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                  selectedFolder === null && !showPinnedOnly && selectedTag === null
                    ? 'bg-violet-600/15 text-violet-300 font-medium'
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                }`}
              >
                <span>جميع الأفكار</span>
                <span className="text-[10px] font-mono text-zinc-500">{notes.length}</span>
              </button>

              <button
                onClick={() => {
                  setShowPinnedOnly(!showPinnedOnly);
                  setSelectedFolder(null);
                  setSelectedTag(null);
                }}
                className={`w-full text-right px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                  showPinnedOnly
                    ? 'bg-amber-500/15 text-amber-300 font-medium'
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Pin size={12} className="text-amber-400" />
                  المثبتة في الصدارة
                </span>
                <span className="text-[10px] font-mono text-zinc-500">
                  {notes.filter((n) => n.pinned).length}
                </span>
              </button>

              {folders.map((folder) => {
                const count = notes.filter((n) => n.folder === folder.id).length;
                const isSelected = selectedFolder === folder.id;
                return (
                  <button
                    key={folder.id}
                    onClick={() => {
                      setSelectedFolder(isSelected ? null : folder.id);
                      setSelectedTag(null);
                      setShowPinnedOnly(false);
                    }}
                    className={`w-full text-right px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'bg-violet-600/20 text-violet-200 font-medium'
                        : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                    }`}
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: folder.color }}
                      />
                      {folder.name}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">{count}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Tags Section */}
        {allTags.length > 0 && (
          <div>
            <button
              onClick={() => setTagsOpen(!tagsOpen)}
              className="w-full flex items-center justify-between text-xs font-semibold text-zinc-400 px-1 py-1 hover:text-zinc-200 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <Hash size={13} className="text-cyan-400" />
                الوسوم (#tags)
              </span>
              {tagsOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>

            {tagsOpen && (
              <div className="mt-1 flex flex-wrap gap-1 px-1">
                {allTags.map((tag) => {
                  const isSelected = selectedTag === tag;
                  return (
                    <button
                      key={tag}
                      onClick={() => {
                        setSelectedTag(isSelected ? null : tag);
                        setSelectedFolder(null);
                      }}
                      className={`text-[11px] px-2 py-0.5 rounded-md transition-colors ${
                        isSelected
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          : 'bg-zinc-900/80 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                      }`}
                    >
                      #{tag}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Notes List */}
        <div>
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-400 px-1 py-1 mb-1">
            <span className="flex items-center gap-1.5">
              <FileText size={13} className="text-emerald-400" />
              الملاحظات ({filteredNotes.length})
            </span>
            {(selectedFolder || selectedTag || showPinnedOnly || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedFolder(null);
                  setSelectedTag(null);
                  setShowPinnedOnly(false);
                  setSearchQuery('');
                }}
                className="text-[10px] text-violet-400 hover:underline"
              >
                مسح التصفية
              </button>
            )}
          </div>

          <div className="space-y-1">
            {filteredNotes.map((note) => {
              const isActive = note.id === activeNoteId;
              return (
                <div
                  key={note.id}
                  onClick={() => {
                    onSelectNote(note.id);
                    onCloseMobile();
                  }}
                  className={`w-full text-right p-2.5 rounded-xl cursor-pointer transition-all border ${
                    isActive
                      ? 'bg-violet-950/40 border-violet-500/40 shadow-sm'
                      : 'bg-zinc-900/40 border-zinc-800/40 hover:bg-zinc-800/60 hover:border-zinc-700/60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1.5">
                    <span
                      className={`text-xs font-medium truncate ${
                        isActive ? 'text-violet-200' : 'text-zinc-200'
                      }`}
                    >
                      {note.title}
                    </span>
                    {note.pinned && (
                      <Pin size={12} className="text-amber-400 flex-shrink-0" />
                    )}
                  </div>

                  <p className="text-[11px] text-zinc-500 truncate mt-1">
                    {note.content
                      .replace(/#+\s+/g, '')
                      .replace(/\[\[|\]\]/g, '')
                      .slice(0, 55)}
                  </p>

                  <div className="flex items-center justify-between mt-2 text-[10px] text-zinc-500">
                    <span className="truncate">
                      {folders.find((f) => f.id === note.folder)?.name}
                    </span>
                    {note.tags.length > 0 && (
                      <span className="text-violet-400/80">#{note.tags[0]}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
};
