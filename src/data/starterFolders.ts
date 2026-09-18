import { Folder } from '../types';

export const STARTER_FOLDERS: Folder[] = [
  {
    id: 'folder-daily',
    name: '📅 اليومية',
    parentId: undefined,
    icon: 'Calendar',
    color: '#8b5cf6',
  },
  {
    id: 'folder-habits',
    name: '🔄 العادات',
    parentId: undefined,
    icon: 'Repeat',
    color: '#06b6d4',
  },
  {
    id: 'folder-goals',
    name: '🎯 الأهداف',
    parentId: undefined,
    icon: 'Target',
    color: '#f59e0b',
  },
  {
    id: 'folder-projects',
    name: '📁 المشاريع',
    parentId: undefined,
    icon: 'Folder',
    color: '#10b981',
  },
  {
    id: 'folder-resources',
    name: '📚 المصادر',
    parentId: undefined,
    icon: 'Book',
    color: '#ec4899',
  },
  {
    id: 'folder-archive',
    name: '🗄️ الأرشيف',
    parentId: undefined,
    icon: 'Archive',
    color: '#6b7280',
  },
];
