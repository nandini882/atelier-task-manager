import React, { useState, useEffect } from 'react';
import type { 
  Task, 
  ActiveView, 
  UserProfile, 
  TaskStatus, 
  EisenhowerQuadrant,
  ProjectCategory 
} from './types/task';
import { 
  defaultCategories, 
  defaultUserProfile 
} from './utils/initialData';
import { sound } from './utils/audio';
import { HeaderNav } from './components/HeaderNav';
import { ManifestoHero } from './components/ManifestoHero';
import { StreamView } from './components/StreamView';
import { CalendarView } from './components/CalendarView';
import { GroupingView } from './components/GroupingView';
import { KanbanView } from './components/KanbanView';
import { FocusView } from './components/FocusView';
import { TaskModal } from './components/TaskModal';
import { ProfileModal } from './components/ProfileModal';
import { CategoryManagerModal } from './components/CategoryManagerModal';
import { PageTransitionCurtain } from './components/PageTransitionCurtain';
import { MagneticCursor } from './components/MagneticCursor';
import './atelier.css';

const DEPRECATED_CATEGORY_NAMES = [
  'creative dev',
  'creative-dev',
  'art direction',
  'art-direction',
  'client projects',
  'client-projects',
  'personal r&d',
  'personal-rd',
  'studio ops',
  'studio-ops',
];

export function App() {
  // 1. STATE PERSISTENCE (LocalStorage)
  // Preserving ALL user tasks without erasing them
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem('atelier_tasks');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Keep all tasks intact, but cleanse old mock category references
          return parsed.map((t: Task) => {
            const catLower = (t.category || '').toLowerCase().trim();
            if (DEPRECATED_CATEGORY_NAMES.includes(catLower)) {
              return { ...t, category: 'General' };
            }
            return t;
          });
        }
      }
    } catch {}
    return [];
  });

  const [categories, setCategories] = useState<ProjectCategory[]>(() => {
    try {
      const saved = localStorage.getItem('atelier_categories');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Remove old mock categories completely
          const cleaned = parsed
            .filter((c: ProjectCategory) => {
              const nameLower = (c.name || '').toLowerCase().trim();
              const idLower = (c.id || '').toLowerCase().trim();
              return !DEPRECATED_CATEGORY_NAMES.includes(nameLower) && !DEPRECATED_CATEGORY_NAMES.includes(idLower);
            })
            .map((c: ProjectCategory) => ({
              ...c,
              subcategories: Array.isArray(c.subcategories) ? c.subcategories : [],
            }));
          return cleaned;
        }
      }
    } catch {}
    return defaultCategories;
  });

  // Ensure any custom category already assigned on existing user tasks is preserved in the categories list
  useEffect(() => {
    setCategories((prev) => {
      const existingNames = new Set(prev.map((c) => c.name.toLowerCase().trim()));
      const updated = [...prev];
      let hasChanges = false;

      tasks.forEach((t) => {
        const catName = (t.category || '').trim();
        const catLower = catName.toLowerCase();
        if (catName && !DEPRECATED_CATEGORY_NAMES.includes(catLower) && !existingNames.has(catLower)) {
          updated.push({
            id: `cat-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            name: catName,
            color: '#E26D5C',
            subcategories: t.subcategory ? [t.subcategory] : [],
          });
          existingNames.add(catLower);
          hasChanges = true;
        } else if (catName && t.subcategory && !DEPRECATED_CATEGORY_NAMES.includes(catLower)) {
          const match = updated.find((c) => c.name.toLowerCase().trim() === catLower);
          if (match && !match.subcategories.includes(t.subcategory)) {
            match.subcategories.push(t.subcategory);
            hasChanges = true;
          }
        }
      });

      return hasChanges ? updated : prev;
    });
  }, [tasks]);

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('atelier_profile');
      if (saved) return JSON.parse(saved);
    } catch {}
    return defaultUserProfile;
  });

  // Active view & filters
  const [activeView, setActiveView] = useState<ActiveView>('stream');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);

  // Transition Curtain Trigger
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [taskModalInitialCategory, setTaskModalInitialCategory] = useState<string | undefined>();
  const [taskModalInitialDate, setTaskModalInitialDate] = useState<string | undefined>();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);

  // Synchronize Theme & LocalStorage
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', userProfile.theme);
    localStorage.setItem('atelier_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('atelier_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('atelier_categories', JSON.stringify(categories));
  }, [categories]);

  // Transition trigger helper
  const changeViewWithTransition = (newView: ActiveView) => {
    if (newView === activeView) return;
    sound.playSwoosh();
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveView(newView);
    }, 320);
    setTimeout(() => {
      setIsTransitioning(false);
    }, 750);
  };

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')) {
        return;
      }

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        sound.playTap();
        setTaskToEdit(null);
        setTaskModalInitialCategory(undefined);
        setTaskModalInitialDate(undefined);
        setIsTaskModalOpen(true);
      } else if (e.key === '1') {
        changeViewWithTransition('stream');
      } else if (e.key === '2') {
        changeViewWithTransition('calendar');
      } else if (e.key === '3') {
        changeViewWithTransition('grouping');
      } else if (e.key === '4') {
        changeViewWithTransition('pipeline');
      } else if (e.key === '5') {
        changeViewWithTransition('focus');
      } else if (e.key === 't' || e.key === 'T') {
        const nextTheme = userProfile.theme === 'cream' ? 'dark' : 'cream';
        setUserProfile((prev) => ({ ...prev, theme: nextTheme }));
        sound.playTap();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeView, userProfile.theme]);

  // Task Actions
  const handleToggleComplete = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const isCompleted = t.status === 'completed';
          return {
            ...t,
            status: isCompleted ? 'in_progress' : 'completed',
            completedAt: isCompleted ? undefined : new Date().toISOString(),
          };
        }
        return t;
      })
    );
  };

  const handleTogglePin = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, pinned: !t.pinned } : t))
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const handleSaveTask = (taskData: Partial<Task>) => {
    if (taskData.id) {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskData.id ? ({ ...t, ...taskData } as Task) : t))
      );
    } else {
      const defaultCat = taskData.category || categories[0]?.name || 'General';
      const newTask: Task = {
        id: `task-${Date.now()}`,
        title: taskData.title || 'Untitled Initiative',
        description: taskData.description || '',
        category: defaultCat,
        subcategory: taskData.subcategory,
        priority: taskData.priority || 'medium',
        status: taskData.status || 'in_progress',
        dueDate: taskData.dueDate || new Date().toISOString().split('T')[0],
        dueTime: taskData.dueTime,
        eisenhower: taskData.eisenhower || 'schedule',
        estimatedMinutes: taskData.estimatedMinutes || 45,
        pinned: taskData.pinned || false,
        tags: taskData.tags || [],
        subtasks: taskData.subtasks || [],
        createdAt: new Date().toISOString(),
      };
      setTasks((prev) => [newTask, ...prev]);
    }
  };

  const handleQuickAdd = (rawInput: string) => {
    let parsedTitle = rawInput;
    let category = selectedCategory || categories[0]?.name || 'General';
    let subcategory = selectedSubcategory || undefined;
    let priority: Task['priority'] = 'medium';
    let dueDate = new Date().toISOString().split('T')[0];

    if (rawInput.includes('!urgent')) {
      priority = 'urgent';
      parsedTitle = parsedTitle.replace('!urgent', '');
    } else if (rawInput.includes('!high')) {
      priority = 'high';
      parsedTitle = parsedTitle.replace('!high', '');
    }

    if (rawInput.toLowerCase().includes('tomorrow')) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      dueDate = tomorrow.toISOString().split('T')[0];
      parsedTitle = parsedTitle.replace(/tomorrow/i, '');
    }

    // Match #Category
    for (const cat of categories) {
      if (rawInput.toLowerCase().includes(`#${cat.name.toLowerCase().replace(/\s+/g, '')}`)) {
        category = cat.name;
        parsedTitle = parsedTitle.replace(new RegExp(`#${cat.name.replace(/\s+/g, '')}`, 'gi'), '');
        break;
      }
    }

    handleSaveTask({
      title: parsedTitle.trim(),
      category,
      subcategory,
      priority,
      dueDate,
      status: 'in_progress',
      subtasks: [],
      tags: [],
    });
  };

  const handleUpdateStatus = (taskId: string, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: newStatus,
              completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined,
            }
          : t
      )
    );
  };

  const handleUpdateQuadrant = (taskId: string, quadrant: EisenhowerQuadrant) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, eisenhower: quadrant } : t))
    );
  };

  // Category and Subcategory Management
  const handleAddCategory = (newCat: ProjectCategory) => {
    setCategories((prev) => [...prev, newCat]);
  };

  const handleDeleteCategory = (catId: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== catId));
  };

  const handleAddSubcategory = (categoryId: string, subcatName: string) => {
    setCategories((prev) =>
      prev.map((c) => {
        if (c.id === categoryId && !c.subcategories.includes(subcatName)) {
          return { ...c, subcategories: [...c.subcategories, subcatName] };
        }
        return c;
      })
    );
  };

  const handleDeleteSubcategory = (categoryId: string, subcatName: string) => {
    setCategories((prev) =>
      prev.map((c) => {
        if (c.id === categoryId) {
          return { ...c, subcategories: c.subcategories.filter((s) => s !== subcatName) };
        }
        return c;
      })
    );
  };

  const handleResetData = () => {
    setTasks([]);
    setCategories([]);
    setUserProfile(defaultUserProfile);
  };

  const handleImportData = (data: {
    tasks: Task[];
    categories?: ProjectCategory[];
    userProfile?: UserProfile;
  }) => {
    if (data.tasks) setTasks(data.tasks);
    if (data.categories) setCategories(data.categories);
    if (data.userProfile) setUserProfile(data.userProfile);
  };

  return (
    <div className="atelier-app">
      {/* Custom Fluid Trailing Magnetic Cursor */}
      <MagneticCursor />

      {/* Curved Screen Transition Curtain */}
      <PageTransitionCurtain isTransitioning={isTransitioning} />

      {/* Floating Glassmorphic Capsule Header */}
      <HeaderNav
        activeView={activeView}
        onViewChange={changeViewWithTransition}
        userProfile={userProfile}
        onUpdateProfile={(upd) => setUserProfile((prev) => ({ ...prev, ...upd }))}
        onOpenNewTaskModal={() => {
          setTaskToEdit(null);
          setTaskModalInitialCategory(selectedCategory || undefined);
          setTaskModalInitialDate(undefined);
          setIsTaskModalOpen(true);
        }}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        taskStats={{
          total: tasks.length,
          dueToday: tasks.filter((t) => t.dueDate === new Date().toISOString().split('T')[0]).length,
          completedToday: tasks.filter(
            (t) => t.status === 'completed' && t.completedAt?.startsWith(new Date().toISOString().split('T')[0])
          ).length,
        }}
      />

      {/* Hero Manifesto & Category Filter Banner */}
      <ManifestoHero
        userProfile={userProfile}
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        selectedSubcategory={selectedSubcategory}
        onSelectSubcategory={setSelectedSubcategory}
        onOpenCategoryManager={() => setIsCategoryManagerOpen(true)}
        tasks={tasks}
      />

      {/* Main View Renderers */}
      <main>
        {activeView === 'stream' && (
          <StreamView
            tasks={tasks}
            categories={categories}
            onToggleComplete={handleToggleComplete}
            onTogglePin={handleTogglePin}
            onDelete={handleDeleteTask}
            onEdit={(task) => {
              setTaskToEdit(task);
              setIsTaskModalOpen(true);
            }}
            onQuickAdd={handleQuickAdd}
            selectedCategory={selectedCategory}
            selectedSubcategory={selectedSubcategory}
          />
        )}

        {activeView === 'calendar' && (
          <CalendarView
            tasks={tasks}
            categories={categories}
            onToggleComplete={handleToggleComplete}
            onTogglePin={handleTogglePin}
            onDelete={handleDeleteTask}
            onEdit={(task) => {
              setTaskToEdit(task);
              setIsTaskModalOpen(true);
            }}
            onOpenNewTaskModalForDate={(dateStr) => {
              setTaskToEdit(null);
              setTaskModalInitialDate(dateStr);
              setIsTaskModalOpen(true);
            }}
          />
        )}

        {activeView === 'grouping' && (
          <GroupingView
            tasks={tasks}
            categories={categories}
            onToggleComplete={handleToggleComplete}
            onTogglePin={handleTogglePin}
            onDelete={handleDeleteTask}
            onEdit={(task) => {
              setTaskToEdit(task);
              setIsTaskModalOpen(true);
            }}
            onUpdateTaskQuadrant={handleUpdateQuadrant}
            onOpenNewTaskModalWithCategory={(catName) => {
              setTaskToEdit(null);
              setTaskModalInitialCategory(catName);
              setIsTaskModalOpen(true);
            }}
            onOpenCategoryManager={() => setIsCategoryManagerOpen(true)}
            onAddSubcategory={handleAddSubcategory}
          />
        )}

        {activeView === 'pipeline' && (
          <KanbanView
            tasks={tasks}
            categories={categories}
            onToggleComplete={handleToggleComplete}
            onTogglePin={handleTogglePin}
            onDelete={handleDeleteTask}
            onEdit={(task) => {
              setTaskToEdit(task);
              setIsTaskModalOpen(true);
            }}
            onUpdateStatus={handleUpdateStatus}
          />
        )}

        {activeView === 'focus' && (
          <FocusView
            tasks={tasks}
            onToggleComplete={handleToggleComplete}
          />
        )}
      </main>

      {/* Task Creation & Edit Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        taskToEdit={taskToEdit}
        categories={categories}
        onAddCategory={handleAddCategory}
        onAddSubcategory={handleAddSubcategory}
        initialCategory={taskModalInitialCategory}
        initialDate={taskModalInitialDate}
      />

      {/* Group & Subcategory Manager Modal */}
      <CategoryManagerModal
        isOpen={isCategoryManagerOpen}
        onClose={() => setIsCategoryManagerOpen(false)}
        categories={categories}
        onAddCategory={handleAddCategory}
        onDeleteCategory={handleDeleteCategory}
        onAddSubcategory={handleAddSubcategory}
        onDeleteSubcategory={handleDeleteSubcategory}
      />

      {/* Profile & Settings Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userProfile={userProfile}
        onSaveProfile={(prof) => setUserProfile(prof)}
        tasks={tasks}
        categories={categories}
        onImportData={handleImportData}
        onResetData={handleResetData}
      />

      {/* Bottom Editorial Footer */}
      <footer 
        style={{ 
          marginTop: '60px', 
          paddingTop: '24px', 
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          color: 'var(--text-muted)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="font-display" style={{ fontWeight: 700, letterSpacing: '0.05em' }}>ATELIER</span>
          <span className="font-mono" style={{ fontSize: '11px' }}>// ARCHITECTURE & CRAFT</span>
        </div>

        <div className="font-mono" style={{ fontSize: '11.5px', display: 'flex', gap: '16px' }}>
          <span>SHORTCUTS: [N] NEW TASK</span>
          <span>[1-5] SWITCH VIEWS</span>
          <span>[T] THEME</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
