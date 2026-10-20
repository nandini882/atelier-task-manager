import type { Task, ProjectCategory, UserProfile } from '../types/task';

export const formatIsoDate = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const categoryColorPresets = [
  '#E26D5C', // Terracotta
  '#E9C46A', // Saffron
  '#2A9D8F', // Sage
  '#9B5DE5', // Lavender
  '#F4A261', // Peach
  '#457B9D', // Ocean Slate
  '#E76F51', // Burnt Sienna
  '#81B29A', // Celadon
];

// Clean empty categories by default — user creates their own groups and subcategories
export const defaultCategories: ProjectCategory[] = [];

// Clean empty tasks by default
export const getDefaultTasks = (): Task[] => [];

export const defaultUserProfile: UserProfile = {
  name: 'Studio',
  role: 'Creator',
  manifesto: 'Focus on what truly matters.',
  theme: 'cream',
  soundEnabled: true,
  clockMode: 'paris',
  dailyFocusGoal: 3,
  streakDays: 1,
};
