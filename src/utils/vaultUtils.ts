import { Note } from '../types';

/**
 * Extract all wiki links [[...]] from note content
 */
export const extractWikiLinks = (content: string): string[] => {
  const regex = /\[\[([^\]]+)\]\]/g;
  const matches: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    const rawTarget = match[1].trim();
    // Handle alias syntax [[Title|Alias]]
    const [targetTitle] = rawTarget.split('|');
    matches.push(targetTitle.trim());
  }

  return [...new Set(matches)]; // Remove duplicates
};

/**
 * Count words in note content
 */
export const countWords = (content: string): number => {
  if (!content || !content.trim()) return 0;
  return content.trim().split(/\s+/).length;
};

/**
 * Estimate reading time in minutes (avg 200 words per minute)
 */
export const estimateReadingTime = (wordCount: number): number => {
  return Math.max(1, Math.ceil(wordCount / 200));
};

/**
 * Get notes that link TO this note (backlinks)
 */
export const getInboundBacklinks = (note: Note, allNotes: Note[]): Note[] => {
  const noteTitleLower = note.title.toLowerCase().trim();
  
  return allNotes.filter((n) => {
    if (n.id === note.id) return false;
    const links = extractWikiLinks(n.content);
    return links.some(
      (link) => link.toLowerCase().trim() === noteTitleLower
    );
  });
};

/**
 * Get notes that this note links TO (outbound links)
 */
export const getOutboundLinks = (note: Note, allNotes: Note[]): Note[] => {
  const links = extractWikiLinks(note.content);
  const linkedNotes: Note[] = [];

  links.forEach((linkTitle) => {
    const found = allNotes.find(
      (n) => n.title.toLowerCase().trim() === linkTitle.toLowerCase().trim()
    );
    if (found && !linkedNotes.includes(found)) {
      linkedNotes.push(found);
    }
  });

  return linkedNotes;
};

/**
 * Get all unique tags from a note's content (#tag)
 */
export const extractHashTags = (content: string): string[] => {
  const regex = /#(\w+)/g;
  const matches: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    matches.push(match[1]);
  }

  return [...new Set(matches)];
};

/**
 * Find orphaned notes (notes with no backlinks and no outbound links)
 */
export const findOrphanedNotes = (allNotes: Note[]): Note[] => {
  return allNotes.filter((note) => {
    const inbound = getInboundBacklinks(note, allNotes);
    const outbound = getOutboundLinks(note, allNotes);
    return inbound.length === 0 && outbound.length === 0;
  });
};

/**
 * Find most connected notes (by total link count)
 */
export const findMostConnectedNotes = (allNotes: Note[], limit: number = 5): Note[] => {
  return allNotes
    .map((note) => ({
      note,
      connectivity: getInboundBacklinks(note, allNotes).length + getOutboundLinks(note, allNotes).length,
    }))
    .sort((a, b) => b.connectivity - a.connectivity)
    .slice(0, limit)
    .map((item) => item.note);
};

/**
 * Search notes by title or content
 */
export const searchNotes = (query: string, allNotes: Note[]): Note[] => {
  const queryLower = query.toLowerCase().trim();
  if (!queryLower) return [];

  return allNotes.filter(
    (note) =>
      note.title.toLowerCase().includes(queryLower) ||
      note.content.toLowerCase().includes(queryLower) ||
      note.tags.some((tag) => tag.toLowerCase().includes(queryLower))
  );
};

/**
 * Get notes by folder
 */
export const getNotesByFolder = (folderId: string, allNotes: Note[]): Note[] => {
  return allNotes.filter((note) => note.folder === folderId);
};

/**
 * Get pinned notes
 */
export const getPinnedNotes = (allNotes: Note[]): Note[] => {
  return allNotes.filter((note) => note.pinned);
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Get graph data for visualization (nodes and edges)
 */
export const getGraphData = (allNotes: Note[]) => {
  const nodes = allNotes.map((note) => ({
    id: note.id,
    title: note.title,
    folder: note.folder,
    pinned: note.pinned,
    backlinkCount: getInboundBacklinks(note, allNotes).length,
    outboundCount: getOutboundLinks(note, allNotes).length,
  }));

  const edges: Array<{ source: string; target: string }> = [];

  allNotes.forEach((note) => {
    const outbound = getOutboundLinks(note, allNotes);
    outbound.forEach((target) => {
      edges.push({
        source: note.id,
        target: target.id,
      });
    });
  });

  return { nodes, edges };
};
