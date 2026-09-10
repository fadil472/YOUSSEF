import { Note, Folder, VaultStats, NodeLink } from '../types';
import { STARTER_NOTES } from '../data/starterNotes';

const STORAGE_KEY = 'obsidian_vortex_vault_v1';

export function loadSavedNotes(): Note[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading notes from localStorage:', e);
  }
  return STARTER_NOTES;
}

export function saveNotesToStorage(notes: Note[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch (e) {
    console.error('Error saving notes to localStorage:', e);
  }
}

/**
 * Extracts [[WikiLink]] targets from text
 */
export function extractWikiLinks(content: string): string[] {
  if (!content) return [];
  const regex = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g;
  const links: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(content)) !== null) {
    const linkTitle = match[1].trim();
    if (linkTitle && !links.includes(linkTitle)) {
      links.push(linkTitle);
    }
  }
  return links;
}

/**
 * Extracts #tags from text
 */
export function extractTagsFromContent(content: string): string[] {
  if (!content) return [];
  // Match tags with Arabic and Latin characters and digits
  const regex = /#([\p{L}\p{N}_-]+)/gu;
  const tags: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(content)) !== null) {
    const tag = match[1].trim();
    if (tag && !tags.includes(tag)) {
      tags.push(tag);
    }
  }
  return tags;
}

/**
 * Computes all directed and undirected links in the vault
 */
export function buildGraphLinks(notes: Note[]): {
  links: NodeLink[];
  connectionCounts: Map<string, { total: number; inbound: number; outbound: number }>;
  adjacencyMap: Map<string, Set<string>>;
} {
  const titleToNote = new Map<string, Note>();
  const idToNote = new Map<string, Note>();
  notes.forEach((n) => {
    titleToNote.set(n.title.toLowerCase().trim(), n);
    idToNote.set(n.id, n);
  });

  const connectionCounts = new Map<string, { total: number; inbound: number; outbound: number }>();
  const adjacencyMap = new Map<string, Set<string>>();

  notes.forEach((n) => {
    connectionCounts.set(n.id, { total: 0, inbound: 0, outbound: 0 });
    adjacencyMap.set(n.id, new Set<string>());
  });

  const directedEdges = new Set<string>(); // "sourceId->targetId"
  const rawLinks: { sourceId: string; targetId: string }[] = [];

  notes.forEach((sourceNote) => {
    const targets = extractWikiLinks(sourceNote.content);
    targets.forEach((targetTitle) => {
      const targetNote = titleToNote.get(targetTitle.toLowerCase().trim());
      if (targetNote && targetNote.id !== sourceNote.id) {
        const edgeKey = `${sourceNote.id}->${targetNote.id}`;
        if (!directedEdges.has(edgeKey)) {
          directedEdges.add(edgeKey);
          rawLinks.push({ sourceId: sourceNote.id, targetId: targetNote.id });

          // Update counts
          const srcCount = connectionCounts.get(sourceNote.id)!;
          srcCount.outbound += 1;
          srcCount.total += 1;

          const tgtCount = connectionCounts.get(targetNote.id)!;
          tgtCount.inbound += 1;
          tgtCount.total += 1;

          adjacencyMap.get(sourceNote.id)!.add(targetNote.id);
          adjacencyMap.get(targetNote.id)!.add(sourceNote.id);
        }
      }
    });
  });

  // Calculate reciprocity
  const links: NodeLink[] = rawLinks.map((link) => {
    const reciprocalKey = `${link.targetId}->${link.sourceId}`;
    return {
      sourceId: link.sourceId,
      targetId: link.targetId,
      isReciprocal: directedEdges.has(reciprocalKey),
    };
  });

  return { links, connectionCounts, adjacencyMap };
}

/**
 * Counts words in a multilingual (Arabic/English) text
 */
export function countWords(text: string): number {
  if (!text) return 0;
  // Strip markdown formatting symbols
  const clean = text
    .replace(/\[\[[^\]]+\]\]/g, ' ')
    .replace(/[#*`_~>[\]()-]/g, ' ')
    .trim();
  const words = clean.split(/\s+/).filter((w) => w.length > 0);
  return words.length;
}

/**
 * Estimate reading time in minutes (average 180 words per minute for Arabic/English)
 */
export function estimateReadingTime(wordCount: number): number {
  return Math.max(1, Math.ceil(wordCount / 180));
}

/**
 * Finds all inbound backlinks to a given note
 */
export function getInboundBacklinks(targetNote: Note, allNotes: Note[]): Note[] {
  const targetTitleLower = targetNote.title.toLowerCase().trim();
  return allNotes.filter((n) => {
    if (n.id === targetNote.id) return false;
    const links = extractWikiLinks(n.content);
    return links.some((l) => l.toLowerCase().trim() === targetTitleLower);
  });
}

/**
 * Finds all outbound notes referenced by this note
 */
export function getOutboundLinks(sourceNote: Note, allNotes: Note[]): Note[] {
  const titles = extractWikiLinks(sourceNote.content).map((t) => t.toLowerCase().trim());
  return allNotes.filter((n) => n.id !== sourceNote.id && titles.includes(n.title.toLowerCase().trim()));
}

/**
 * Calculates comprehensive vault statistics for the statistics dashboard
 */
export function calculateVaultStats(notes: Note[], folders: Folder[]): VaultStats {
  const n = notes.length;
  if (n === 0) {
    return {
      totalNotes: 0,
      totalLinks: 0,
      totalWords: 0,
      readingTimeMinutes: 0,
      avgWordsPerNote: 0,
      density: 0,
      orphanCount: 0,
      reciprocityRate: 0,
      topConnected: [],
      orphans: [],
      tagDistribution: [],
      folderDistribution: [],
      gravityRings: {
        core: { count: 0, label: 'عين الدوامة (النواة)', notes: [] },
        inner: { count: 0, label: 'المدار الداخلي', notes: [] },
        outer: { count: 0, label: 'المدار الخارجي', notes: [] },
        periphery: { count: 0, label: 'أطراف الدوامة (المنعزلة)', notes: [] },
      },
    };
  }

  const { links, connectionCounts } = buildGraphLinks(notes);
  const totalLinks = links.length;

  let totalWords = 0;
  notes.forEach((note) => {
    totalWords += countWords(note.content);
  });

  const readingTimeMinutes = estimateReadingTime(totalWords);
  const avgWordsPerNote = Math.round(totalWords / n);

  // Graph Density: 2 * E / (V * (V - 1)) for undirected connections
  const maxPossibleLinks = (n * (n - 1)) / 2;
  const density = maxPossibleLinks > 0 ? Number((totalLinks / maxPossibleLinks).toFixed(3)) : 0;

  // Reciprocal links
  const reciprocalLinksCount = links.filter((l) => l.isReciprocal).length;
  const reciprocityRate = totalLinks > 0 ? Math.round((reciprocalLinksCount / totalLinks) * 100) : 0;

  // Connected ranking & Orphans
  const notesWithCounts = notes.map((note) => ({
    note,
    count: connectionCounts.get(note.id)?.total || 0,
  }));

  notesWithCounts.sort((a, b) => b.count - a.count);

  const topConnected = notesWithCounts.slice(0, 7);
  const orphans = notesWithCounts.filter((item) => item.count === 0).map((item) => item.note);
  const orphanCount = orphans.length;

  // Tags breakdown
  const tagCounts = new Map<string, number>();
  notes.forEach((note) => {
    const combinedTags = new Set([...note.tags, ...extractTagsFromContent(note.content)]);
    combinedTags.forEach((tag) => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    });
  });

  const tagDistribution = Array.from(tagCounts.entries())
    .map(([tag, count]) => ({
      tag,
      count,
      percentage: Math.round((count / n) * 100),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Folder breakdown
  const folderCounts = new Map<string, number>();
  notes.forEach((note) => {
    folderCounts.set(note.folder, (folderCounts.get(note.folder) || 0) + 1);
  });

  const folderDistribution = folders.map((folder) => {
    const count = folderCounts.get(folder.id) || 0;
    return {
      folder: folder.name,
      count,
      percentage: Math.round((count / n) * 100),
      color: folder.color,
    };
  });

  // Vortex Gravity rings categorization
  const maxConn = Math.max(...notesWithCounts.map((i) => i.count), 1);
  const coreNotes: Note[] = [];
  const innerNotes: Note[] = [];
  const outerNotes: Note[] = [];
  const peripheryNotes: Note[] = [];

  notesWithCounts.forEach(({ note, count }) => {
    if (count === 0) {
      peripheryNotes.push(note);
    } else if (count >= maxConn * 0.6) {
      coreNotes.push(note);
    } else if (count >= maxConn * 0.3) {
      innerNotes.push(note);
    } else {
      outerNotes.push(note);
    }
  });

  return {
    totalNotes: n,
    totalLinks,
    totalWords,
    readingTimeMinutes,
    avgWordsPerNote,
    density,
    orphanCount,
    reciprocityRate,
    topConnected,
    orphans,
    tagDistribution,
    folderDistribution,
    gravityRings: {
      core: { count: coreNotes.length, label: 'عين الدوامة (النواة المركزة)', notes: coreNotes },
      inner: { count: innerNotes.length, label: 'المدار الداخلي النشط', notes: innerNotes },
      outer: { count: outerNotes.length, label: 'المدار الخارجي', notes: outerNotes },
      periphery: { count: peripheryNotes.length, label: 'أطراف الدوامة (الملاحظات المنعزلة)', notes: peripheryNotes },
    },
  };
}
