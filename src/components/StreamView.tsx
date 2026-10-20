import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  X,
  Sparkles
} from 'lucide-react';
import type { Task, ProjectCategory } from '../types/task';
import { TaskCard } from './TaskCard';
import { sound } from '../utils/audio';

interface StreamViewProps {
  tasks: Task[];
  categories: ProjectCategory[];
  onToggleComplete: (taskId: string) => void;
  onTogglePin: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onQuickAdd: (title: string) => void;
  selectedCategory: string | null;
  selectedSubcategory?: string | null;
}

export const StreamView: React.FC<StreamViewProps> = ({
  tasks,
  categories,
  onToggleComplete,
  onTogglePin,
  onDelete,
  onEdit,
  onQuickAdd,
  selectedCategory,
  selectedSubcategory,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'active' | 'completed'>('active');
  const [quickInput, setQuickInput] = useState('');

  const handleQuickAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;
    sound.playTap();
    onQuickAdd(quickInput.trim());
    setQuickInput('');
  };

  const filteredTasks = tasks.filter((task) => {
    if (selectedCategory && task.category.toLowerCase() !== selectedCategory.toLowerCase()) {
      return false;
    }
    if (selectedSubcategory && task.subcategory?.toLowerCase() !== selectedSubcategory.toLowerCase()) {
      return false;
    }
    if (statusFilter === 'active' && task.status === 'completed') return false;
    if (statusFilter === 'completed' && task.status !== 'completed') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchDesc = task.description.toLowerCase().includes(q);
      const matchCategory = task.category.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchCategory) return false;
    }

    return true;
  });

  const pinnedTasks = filteredTasks.filter((t) => t.pinned);
  const regularTasks = filteredTasks.filter((t) => !t.pinned);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Minimalist Single-Line Quick Add Bar */}
      <form onSubmit={handleQuickAddSubmit} style={{ position: 'relative', width: '100%' }}>
        <input
          type="text"
          value={quickInput}
          onChange={(e) => setQuickInput(e.target.value)}
          placeholder="Write a task or intention... [Enter to save]"
          style={{
            width: '100%',
            padding: '18px 56px 18px 24px',
            borderRadius: '999px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            fontSize: '15.5px',
            color: 'var(--text-primary)',
            boxShadow: 'var(--shadow-card)',
            transition: 'all 0.25s var(--ease-spring)',
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent-terracotta)')}
          onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border-color)')}
        />
        <button
          type="submit"
          disabled={!quickInput.trim()}
          style={{
            position: 'absolute',
            right: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: quickInput.trim() ? 'var(--accent-terracotta)' : 'var(--tag-bg)',
            color: quickInput.trim() ? '#fff' : 'var(--text-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
          }}
          title="Add task"
        >
          <Plus size={18} />
        </button>
      </form>

      {/* Understated Filter & Search Strip */}
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          gap: '12px' 
        }}
      >
        {/* Active vs Completed Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {(['active', 'completed'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => {
                sound.playClick(700);
                setStatusFilter(mode);
              }}
              className="zh-link"
              style={{
                padding: '6px 14px',
                borderRadius: '999px',
                fontSize: '13px',
                fontWeight: statusFilter === mode ? 600 : 400,
                color: statusFilter === mode ? 'var(--text-primary)' : 'var(--text-subtle)',
                background: statusFilter === mode ? 'var(--tag-bg)' : 'transparent',
                textTransform: 'capitalize',
              }}
            >
              {mode} ({tasks.filter((t) => mode === 'active' ? t.status !== 'completed' : t.status === 'completed').length})
            </button>
          ))}
        </div>

        {/* Minimal Search Input */}
        <div style={{ position: 'relative', width: '220px' }}>
          <Search 
            size={13} 
            style={{ 
              position: 'absolute', 
              left: '12px', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              color: 'var(--text-subtle)' 
            }} 
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            style={{
              width: '100%',
              padding: '7px 28px 7px 32px',
              borderRadius: '999px',
              background: 'transparent',
              border: '1px solid var(--border-color)',
              fontSize: '12.5px',
              color: 'var(--text-primary)',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-subtle)',
              }}
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Main Task List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {pinnedTasks.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '8px' }}>
            {pinnedTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                category={categories.find((c) => c.name.toLowerCase() === task.category.toLowerCase())}
                onToggleComplete={onToggleComplete}
                onTogglePin={onTogglePin}
                onDelete={onDelete}
                onEdit={onEdit}
              />
            ))}
          </div>
        )}

        {regularTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            category={categories.find((c) => c.name.toLowerCase() === task.category.toLowerCase())}
            onToggleComplete={onToggleComplete}
            onTogglePin={onTogglePin}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        ))}

        {filteredTasks.length === 0 && (
          <div 
            style={{ 
              textAlign: 'center', 
              padding: '80px 20px', 
              borderRadius: '24px',
              background: 'var(--bg-surface)',
              border: '1px dashed var(--border-subtle)',
              margin: '20px 0'
            }}
          >
            <Sparkles size={28} style={{ color: 'var(--accent-terracotta)', marginBottom: '16px', opacity: 0.8 }} />
            <h3 className="font-display" style={{ fontSize: '22px', fontWeight: 600, marginBottom: '6px' }}>
              A quiet canvas.
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '380px', margin: '0 auto' }}>
              No tasks logged yet. Type above or press <span className="font-mono" style={{ padding: '2px 6px', background: 'var(--tag-bg)', borderRadius: '4px' }}>[N]</span> to create your first intention.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
