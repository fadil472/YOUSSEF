import React, { useState, useMemo } from 'react';
import { Note, Folder } from '../types';
import {
  countWords,
  estimateReadingTime,
  getInboundBacklinks,
  getOutboundLinks,
  extractWikiLinks,
} from '../utils/vaultUtils';
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  List,
  CheckSquare,
  Quote,
  Code,
  Link as LinkIcon,
  Trash2,
  Pin,
  PinOff,
  Eye,
  Edit3,
  Columns,
  Sparkles,
  ArrowUpRight,
  Plus,
  Hash,
  Folder as FolderIcon,
  Clock,
  Orbit,
} from 'lucide-react';

interface NoteEditorProps {
  note: Note;
  allNotes: Note[];
  folders: Folder[];
  onUpdateNote: (updatedNote: Note) => void;
  onDeleteNote: (noteId: string) => void;
  onSelectNote: (noteId: string) => void;
  onCreateNoteWithTitle?: (title: string) => void;
}

type EditorViewMode = 'edit' | 'preview' | 'split';

export const NoteEditor: React.FC<NoteEditorProps> = ({
  note,
  allNotes,
  folders,
  onUpdateNote,
  onDeleteNote,
  onSelectNote,
  onCreateNoteWithTitle,
}) => {
  const [viewMode, setViewMode] = useState<EditorViewMode>('split');
  const [showLinkPicker, setShowLinkPicker] = useState<boolean>(false);
  const [newTagInput, setNewTagInput] = useState<string>('');

  const wordCount = useMemo(() => countWords(note.content), [note.content]);
  const readingTime = useMemo(() => estimateReadingTime(wordCount), [wordCount]);

  // Backlinks & Outlinks
  const inboundBacklinks = useMemo(
    () => getInboundBacklinks(note, allNotes),
    [note, allNotes]
  );
  const outboundLinks = useMemo(
    () => getOutboundLinks(note, allNotes),
    [note, allNotes]
  );

  // Suggested notes to link (notes sharing tags or category but not yet linked)
  const suggestedNotes = useMemo(() => {
    const linkedIds = new Set([
      note.id,
      ...inboundBacklinks.map((n) => n.id),
      ...outboundLinks.map((n) => n.id),
    ]);
    return allNotes
      .filter((n) => !linkedIds.has(n.id))
      .filter(
        (n) =>
          n.folder === note.folder ||
          n.tags.some((t) => note.tags.includes(t))
      )
      .slice(0, 3);
  }, [note, allNotes, inboundBacklinks, outboundLinks]);

  // Handle text modifications
  const handleContentChange = (content: string) => {
    onUpdateNote({
      ...note,
      content,
      updatedAt: Date.now(),
    });
  };

  const handleTitleChange = (title: string) => {
    onUpdateNote({
      ...note,
      title,
      updatedAt: Date.now(),
    });
  };

  const handleFolderChange = (folder: string) => {
    onUpdateNote({
      ...note,
      folder,
      updatedAt: Date.now(),
    });
  };

  const handleTogglePin = () => {
    onUpdateNote({
      ...note,
      pinned: !note.pinned,
      updatedAt: Date.now(),
    });
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newTagInput.trim()) {
      e.preventDefault();
      const cleanTag = newTagInput.trim().replace(/^#/, '');
      if (!note.tags.includes(cleanTag)) {
        onUpdateNote({
          ...note,
          tags: [...note.tags, cleanTag],
          updatedAt: Date.now(),
        });
      }
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onUpdateNote({
      ...note,
      tags: note.tags.filter((t) => t !== tagToRemove),
      updatedAt: Date.now(),
    });
  };

  // Helper to insert markdown tags at selection or cursor
  const insertMarkdown = (prefix: string, suffix: string = '') => {
    const textarea = document.getElementById('note-markdown-textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = note.content;
    const selected = currentText.substring(start, end);

    const replacement = `${prefix}${selected || 'نص'}${suffix}`;
    const newContent =
      currentText.substring(0, start) + replacement + currentText.substring(end);

    handleContentChange(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + (selected ? selected.length : 2)
      );
    }, 10);
  };

  const insertWikiLink = (targetTitle: string) => {
    insertMarkdown(`[[${targetTitle}]]`);
    setShowLinkPicker(false);
  };

  // Render markdown parser with clickable [[WikiLinks]]
  const renderFormattedMarkdown = (markdown: string) => {
    if (!markdown) {
      return (
        <p className="text-zinc-500 italic text-sm">
          الملاحظة فارغة. ابدأ بالكتابة هنا أو استخدم شريط الأدوات بالأعلى...
        </p>
      );
    }

    const lines = markdown.split('\n');

    return (
      <div className="space-y-3 leading-relaxed text-zinc-200">
        {lines.map((line, lineIdx) => {
          // Headers
          if (line.startsWith('# ')) {
            return (
              <h1
                key={lineIdx}
                className="text-2xl font-bold text-zinc-100 pb-2 border-b border-zinc-800 mt-4 mb-2"
              >
                {renderInlineTokens(line.replace('# ', ''))}
              </h1>
            );
          }
          if (line.startsWith('## ')) {
            return (
              <h2
                key={lineIdx}
                className="text-xl font-semibold text-zinc-100 mt-4 mb-2 text-violet-300"
              >
                {renderInlineTokens(line.replace('## ', ''))}
              </h2>
            );
          }
          if (line.startsWith('### ')) {
            return (
              <h3
                key={lineIdx}
                className="text-base font-semibold text-zinc-200 mt-3 mb-1"
              >
                {renderInlineTokens(line.replace('### ', ''))}
              </h3>
            );
          }

          // Task lists
          if (line.startsWith('- [ ] ') || line.startsWith('- [x] ')) {
            const isChecked = line.startsWith('- [x] ');
            const taskText = line.replace(/- \[[ x]\] /, '');
            return (
              <div key={lineIdx} className="flex items-center gap-2.5 py-0.5">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => {
                    const newLines = [...lines];
                    newLines[lineIdx] = isChecked
                      ? `- [ ] ${taskText}`
                      : `- [x] ${taskText}`;
                    handleContentChange(newLines.join('\n'));
                  }}
                  className="w-4 h-4 rounded accent-violet-500 cursor-pointer"
                />
                <span className={`text-sm ${isChecked ? 'line-through text-zinc-500' : 'text-zinc-200'}`}>
                  {renderInlineTokens(taskText)}
                </span>
              </div>
            );
          }

          // Bullet list
          if (line.startsWith('- ') || line.startsWith('* ')) {
            return (
              <li key={lineIdx} className="text-sm list-disc mr-5 text-zinc-300">
                {renderInlineTokens(line.substring(2))}
              </li>
            );
          }

          // Numbered list
          if (/^\d+\.\s/.test(line)) {
            const clean = line.replace(/^\d+\.\s/, '');
            return (
              <div key={lineIdx} className="text-sm mr-4 flex items-start gap-2 text-zinc-300">
                <span className="text-violet-400 font-mono text-xs mt-0.5">
                  {line.match(/^\d+/)?.[0]}.
                </span>
                <span>{renderInlineTokens(clean)}</span>
              </div>
            );
          }

          // Blockquote
          if (line.startsWith('> ')) {
            return (
              <blockquote
                key={lineIdx}
                className="border-r-4 border-violet-500/70 pr-4 py-1.5 bg-violet-950/20 rounded-l-lg text-sm text-zinc-300 italic my-2"
              >
                {renderInlineTokens(line.replace('> ', ''))}
              </blockquote>
            );
          }

          // Empty line
          if (!line.trim()) {
            return <div key={lineIdx} className="h-2" />;
          }

          // Standard paragraph
          return (
            <p key={lineIdx} className="text-sm text-zinc-300 leading-relaxed">
              {renderInlineTokens(line)}
            </p>
          );
        })}
      </div>
    );
  };

  // Helper to parse [[WikiLinks]], **bold**, *italic*, \`code\`
  const renderInlineTokens = (text: string) => {
    // Match [[...]], **...**, *...*, `...`
    const parts: React.ReactNode[] = [];
    const regex = /(\[\[[^\]]+\]\]|\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }

      const token = match[0];

      // [[WikiLink]]
      if (token.startsWith('[[') && token.endsWith(']]')) {
        const rawTarget = token.slice(2, -2).trim();
        const [targetTitle, alias] = rawTarget.split('|');
        const displayLabel = alias || targetTitle;
        const targetNote = allNotes.find(
          (n) => n.title.toLowerCase().trim() === targetTitle.toLowerCase().trim()
        );

        parts.push(
          <button
            key={match.index}
            onClick={() => {
              if (targetNote) {
                onSelectNote(targetNote.id);
              } else if (onCreateNoteWithTitle) {
                onCreateNoteWithTitle(targetTitle);
              }
            }}
            className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md font-medium text-xs transition-colors mx-0.5 ${
              targetNote
                ? 'bg-violet-500/20 text-violet-300 hover:bg-violet-500/35 border border-violet-500/30'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 border border-dashed border-zinc-600'
            }`}
            title={targetNote ? `الانتقال إلى ملاحظة: ${targetNote.title}` : `إنشاء ملاحظة جديدة: ${targetTitle}`}
          >
            <span className="text-violet-400">[[</span>
            <span>{displayLabel}</span>
            <span className="text-violet-400">]]</span>
          </button>
        );
      }
      // **Bold**
      else if (token.startsWith('**') && token.endsWith('**')) {
        parts.push(
          <strong key={match.index} className="font-bold text-zinc-100">
            {token.slice(2, -2)}
          </strong>
        );
      }
      // *Italic*
      else if (token.startsWith('*') && token.endsWith('*')) {
        parts.push(
          <em key={match.index} className="italic text-zinc-200">
            {token.slice(1, -1)}
          </em>
        );
      }
      // `Code`
      else if (token.startsWith('`') && token.endsWith('`')) {
        parts.push(
          <code
            key={match.index}
            className="px-1.5 py-0.5 rounded bg-zinc-800 text-violet-300 font-mono text-xs border border-zinc-700/60"
          >
            {token.slice(1, -1)}
          </code>
        );
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  return (
    <div
      id="note-editor-container"
      className="h-full flex flex-col bg-[#0f111a] border-r border-zinc-800/80 overflow-hidden"
    >
      {/* Top Header Bar */}
      <div className="px-6 py-4 border-b border-zinc-800/80 bg-[#131622]/90 flex flex-wrap items-center justify-between gap-3">
        {/* Title Input & Metadata */}
        <div className="flex-1 min-w-[240px]">
          <input
            id="note-title-input"
            type="text"
            value={note.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="عنوان الملاحظة..."
            className="w-full bg-transparent text-xl font-bold text-zinc-100 focus:outline-none placeholder:text-zinc-600 border-none p-0"
          />

          <div className="flex items-center gap-3 mt-2 text-xs text-zinc-400">
            {/* Folder Selector */}
            <div className="flex items-center gap-1.5">
              <FolderIcon size={14} className="text-zinc-500" />
              <select
                id="note-folder-select"
                value={note.folder}
                onChange={(e) => handleFolderChange(e.target.value)}
                className="bg-zinc-800/80 text-zinc-300 rounded-lg px-2 py-0.5 border border-zinc-700/60 focus:outline-none text-xs cursor-pointer"
              >
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Reading Time & Words */}
            <span className="flex items-center gap-1 text-zinc-500 font-mono">
              <Clock size={13} />
              {readingTime} د قراءة ({wordCount} كلمة)
            </span>

            {/* Vortex Connectivity Status */}
            <span className="flex items-center gap-1 text-violet-400 bg-violet-950/40 px-2 py-0.5 rounded-full border border-violet-800/40 text-[11px]">
              <Orbit size={12} />
              {inboundBacklinks.length + outboundLinks.length} روابط في الدوامة
            </span>
          </div>
        </div>

        {/* View Mode & Actions */}
        <div className="flex items-center gap-2">
          {/* View Mode Switcher */}
          <div className="flex items-center bg-zinc-900/90 rounded-xl p-0.5 border border-zinc-800">
            <button
              id="viewmode-edit-btn"
              onClick={() => setViewMode('edit')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'edit'
                  ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="محرر Markdown فقط"
            >
              <Edit3 size={15} />
            </button>
            <button
              id="viewmode-split-btn"
              onClick={() => setViewMode('split')}
              className={`p-1.5 rounded-lg transition-colors hidden sm:block ${
                viewMode === 'split'
                  ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="تقسيم الشاشة (تحرير ومعاينة)"
            >
              <Columns size={15} />
            </button>
            <button
              id="viewmode-preview-btn"
              onClick={() => setViewMode('preview')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'preview'
                  ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="معاينة حية للقراءة فقط"
            >
              <Eye size={15} />
            </button>
          </div>

          {/* Pin Note */}
          <button
            id="pin-note-btn"
            onClick={handleTogglePin}
            className={`p-2 rounded-xl border transition-colors ${
              note.pinned
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 border-zinc-800'
            }`}
            title={note.pinned ? 'إلغاء التثبيت' : 'تثبيت الملاحظة في الأعلى'}
          >
            {note.pinned ? <Pin size={16} /> : <PinOff size={16} />}
          </button>

          {/* Delete Note */}
          <button
            id="delete-note-btn"
            onClick={() => {
              if (window.confirm(`هل أنت متأكد من حذف ملاحظة "${note.title}" من الدوامة؟`)) {
                onDeleteNote(note.id);
              }
            }}
            className="p-2 rounded-xl bg-zinc-900/80 hover:bg-rose-950/40 text-zinc-400 hover:text-rose-400 border border-zinc-800 transition-colors"
            title="حذف الملاحظة"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Markdown Toolbar (Shown in Edit & Split mode) */}
      {(viewMode === 'edit' || viewMode === 'split') && (
        <div className="px-6 py-2 border-b border-zinc-800/60 bg-[#121520]/70 flex items-center justify-between gap-1 overflow-x-auto">
          <div className="flex items-center gap-1">
            <button
              onClick={() => insertMarkdown('**', '**')}
              className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-lg"
              title="عريض (Bold)"
            >
              <Bold size={15} />
            </button>
            <button
              onClick={() => insertMarkdown('*', '*')}
              className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-lg"
              title="مائل (Italic)"
            >
              <Italic size={15} />
            </button>
            <div className="h-4 w-[1px] bg-zinc-800 mx-1" />

            <button
              onClick={() => insertMarkdown('# ')}
              className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-lg"
              title="عنوان 1"
            >
              <Heading1 size={15} />
            </button>
            <button
              onClick={() => insertMarkdown('## ')}
              className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-lg"
              title="عنوان 2"
            >
              <Heading2 size={15} />
            </button>
            <div className="h-4 w-[1px] bg-zinc-800 mx-1" />

            <button
              onClick={() => insertMarkdown('- ')}
              className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-lg"
              title="قائمة نقطية"
            >
              <List size={15} />
            </button>
            <button
              onClick={() => insertMarkdown('- [ ] ')}
              className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-lg"
              title="قائمة مهام"
            >
              <CheckSquare size={15} />
            </button>
            <button
              onClick={() => insertMarkdown('> ')}
              className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-lg"
              title="اقتباس"
            >
              <Quote size={15} />
            </button>
            <button
              onClick={() => insertMarkdown('`', '`')}
              className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-lg"
              title="كود مضمن"
            >
              <Code size={15} />
            </button>

            <div className="h-4 w-[1px] bg-zinc-800 mx-1" />

            {/* Quick WikiLink Inserter */}
            <div className="relative">
              <button
                id="insert-wikilink-btn"
                onClick={() => setShowLinkPicker(!showLinkPicker)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 text-xs transition-colors"
                title="إدراج رابط لملاحظة أخرى بالدوامة [[...]]"
              >
                <LinkIcon size={13} />
                <span>ربط بملاحظة [[..]]</span>
              </button>

              {showLinkPicker && (
                <div className="absolute top-full mt-2 right-0 w-64 bg-[#141724] border border-zinc-700/80 rounded-xl shadow-2xl p-2 z-40 max-h-60 overflow-y-auto">
                  <div className="text-[11px] font-semibold text-zinc-400 px-2 py-1 mb-1 border-b border-zinc-800">
                    اختر ملاحظة لربطها:
                  </div>
                  {allNotes
                    .filter((n) => n.id !== note.id)
                    .map((n) => (
                      <button
                        key={n.id}
                        onClick={() => insertWikiLink(n.title)}
                        className="w-full text-right px-2 py-1.5 rounded-lg text-xs text-zinc-200 hover:bg-violet-600/20 hover:text-violet-200 flex items-center justify-between transition-colors"
                      >
                        <span className="truncate">{n.title}</span>
                        <ArrowUpRight size={12} className="text-zinc-500" />
                      </button>
                    ))}
                </div>
              )}
            </div>
          </div>

          <span className="text-[11px] text-zinc-500 hidden md:block">
            يدعم صيغة Obsidian: <code className="text-violet-400">[[العنوان]]</code>
          </span>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor Pane */}
        {(viewMode === 'edit' || viewMode === 'split') && (
          <div className="flex-1 h-full flex flex-col p-6 overflow-y-auto">
            <textarea
              id="note-markdown-textarea"
              value={note.content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="اكتب أفكارك بصيغة Markdown... يمكنك ربط الملاحظات بكتابة [[اسم الملاحظة]] والوسوم بـ #وسم"
              className="w-full h-full bg-transparent text-zinc-200 placeholder:text-zinc-600 focus:outline-none resize-none font-mono text-sm leading-relaxed border-none p-0"
              dir="auto"
            />
          </div>
        )}

        {/* Divider if split view */}
        {viewMode === 'split' && (
          <div className="w-[1px] bg-zinc-800/80 h-full hidden sm:block" />
        )}

        {/* Live Preview Pane */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div
            className={`flex-1 h-full p-6 overflow-y-auto ${
              viewMode === 'split' ? 'hidden sm:block bg-[#11131e]/50' : ''
            }`}
          >
            {renderFormattedMarkdown(note.content)}
          </div>
        )}
      </div>

      {/* Tags Chips Bar */}
      <div className="px-6 py-2.5 border-t border-zinc-800/80 bg-[#121420]/80 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 text-zinc-400 text-xs">
          <Hash size={13} className="text-violet-400" />
          <span>الوسوم:</span>
        </div>

        {note.tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-zinc-800/90 text-xs text-zinc-300 border border-zinc-700/60"
          >
            <span>#{tag}</span>
            <button
              onClick={() => handleRemoveTag(tag)}
              className="text-zinc-500 hover:text-rose-400 transition-colors"
            >
              ×
            </button>
          </span>
        ))}

        <input
          type="text"
          value={newTagInput}
          onChange={(e) => setNewTagInput(e.target.value)}
          onKeyDown={handleAddTag}
          placeholder="+ أضف وسماً (اضغط Enter)"
          className="bg-transparent text-xs text-zinc-300 placeholder:text-zinc-600 focus:outline-none border-none py-0.5 px-1 min-w-[120px]"
        />
      </div>

      {/* Obsidian Backlinks & Knowledge Vortex Drawer */}
      <div className="border-t border-zinc-800/80 bg-[#0d0f17] p-4 max-h-48 overflow-y-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          {/* Inbound Backlinks */}
          <div>
            <div className="font-semibold text-zinc-300 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <LinkIcon size={13} />
                مراجع واردة (تذكر هذه الملاحظة)
              </span>
              <span className="text-zinc-500 font-mono font-bold">
                {inboundBacklinks.length}
              </span>
            </div>
            {inboundBacklinks.length === 0 ? (
              <p className="text-zinc-600 text-[11px]">لا توجد ملاحظات تشير إلى هنا بعد.</p>
            ) : (
              <div className="space-y-1">
                {inboundBacklinks.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => onSelectNote(n.id)}
                    className="w-full text-right px-2 py-1 rounded bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 text-xs flex items-center justify-between transition-colors"
                  >
                    <span className="truncate">{n.title}</span>
                    <ArrowUpRight size={12} className="text-cyan-400" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Outbound Links */}
          <div>
            <div className="font-semibold text-zinc-300 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-violet-400">
                <ArrowUpRight size={13} />
                روابط خارجة (تشير إليها هذه الملاحظة)
              </span>
              <span className="text-zinc-500 font-mono font-bold">
                {outboundLinks.length}
              </span>
            </div>
            {outboundLinks.length === 0 ? (
              <p className="text-zinc-600 text-[11px]">لا ترتبط هذه الملاحظة بملاحظات أخرى بعد.</p>
            ) : (
              <div className="space-y-1">
                {outboundLinks.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => onSelectNote(n.id)}
                    className="w-full text-right px-2 py-1 rounded bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 text-xs flex items-center justify-between transition-colors"
                  >
                    <span className="truncate">{n.title}</span>
                    <ArrowUpRight size={12} className="text-violet-400" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Suggested Links to strengthen the vortex */}
          <div>
            <div className="font-semibold text-zinc-300 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-amber-400">
                <Sparkles size={13} />
                اقتراحات لتعزيز الجاذبية الدوامية
              </span>
            </div>
            {suggestedNotes.length === 0 ? (
              <p className="text-zinc-600 text-[11px]">الروابط مثالية في هذا المحور.</p>
            ) : (
              <div className="space-y-1">
                {suggestedNotes.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => insertWikiLink(n.title)}
                    className="w-full text-right px-2 py-1 rounded bg-amber-950/20 hover:bg-amber-950/40 text-amber-200/90 text-xs flex items-center justify-between transition-colors border border-amber-900/30"
                    title="إدراج رابط في الملاحظة لربطها بالدوامة"
                  >
                    <span className="truncate">+ ربط: {n.title}</span>
                    <Plus size={12} className="text-amber-400" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
