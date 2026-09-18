import { RecurringTask, ObsidianNote } from '../types';
import { STORAGE_TASKS_KEY, STORAGE_NOTES_KEY } from '../constants';

/**
 * Custom hook for managing tasks with localStorage persistence
 */
export function useTasks() {
  const getInitialTasks = (): RecurringTask[] => {
    try {
      const saved = localStorage.getItem(STORAGE_TASKS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading tasks:', e);
    }
    return [];
  };

  const setTasks = (tasks: RecurringTask[]) => {
    try {
      localStorage.setItem(STORAGE_TASKS_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.error('Error saving tasks:', e);
    }
  };

  return { getInitialTasks, setTasks };
}

/**
 * Custom hook for managing notes with localStorage persistence
 */
export function useNotes() {
  const getInitialNotes = (): ObsidianNote[] => {
    try {
      const saved = localStorage.getItem(STORAGE_NOTES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading notes:', e);
    }
    return [];
  };

  const setNotes = (notes: ObsidianNote[]) => {
    try {
      localStorage.setItem(STORAGE_NOTES_KEY, JSON.stringify(notes));
    } catch (e) {
      console.error('Error saving notes:', e);
    }
  };

  return { getInitialNotes, setNotes };
}
