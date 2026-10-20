export type TaskStatus = 'backlog' | 'in_progress' | 'in_review' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type EisenhowerQuadrant = 'do_first' | 'schedule' | 'delegate' | 'backlog';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  category: string;
  subcategory?: string; // Optional user subcategory
  eisenhower: EisenhowerQuadrant;
  subtasks: Subtask[];
  estimatedMinutes: number;
  tags: string[];
  pinned: boolean;
  createdAt: string;
  completedAt?: string;
}

export interface ProjectCategory {
  id: string;
  name: string;
  description?: string;
  color: string; // Accent color hex
  subcategories: string[]; // List of user-defined subcategories
}

export interface UserProfile {
  name: string;
  role: string;
  manifesto: string;
  theme: 'cream' | 'dark';
  soundEnabled: boolean;
  clockMode: 'local' | 'paris';
  dailyFocusGoal: number;
  streakDays: number;
  avatarSeed?: string;
}

export type ActiveView = 'stream' | 'calendar' | 'grouping' | 'pipeline' | 'focus';
export type GroupingMode = 'project' | 'deadline' | 'eisenhower';
export type CalendarMode = 'month' | 'week' | 'agenda';
