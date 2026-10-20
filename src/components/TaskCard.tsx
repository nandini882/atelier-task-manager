import React, { useRef } from 'react';
import { 
  Check, 
  Clock, 
  Pin, 
  Trash2
} from 'lucide-react';
import type { Task, ProjectCategory } from '../types/task';
import { sound } from '../utils/audio';
import { triggerConfetti } from '../utils/particles';

interface TaskCardProps {
  task: Task;
  category?: ProjectCategory;
  onToggleComplete: (taskId: string) => void;
  onTogglePin: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onEdit: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  category,
  onToggleComplete,
  onTogglePin,
  onDelete,
  onEdit,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  // Subtle 3D tilt on mousemove
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -4;
    const rotateY = ((x - centerX) / centerX) * 4;

    cardRef.current.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0px)';
  };

  const getDeadlineText = () => {
    if (!task.dueDate) return null;
    const todayStr = new Date().toISOString().split('T')[0];
    const isCompleted = task.status === 'completed';

    if (isCompleted) return { text: 'Done', isOverdue: false };
    if (task.dueDate < todayStr) return { text: `Overdue`, isOverdue: true };
    if (task.dueDate === todayStr) return { text: `Today${task.dueTime ? ` ${task.dueTime}` : ''}`, isOverdue: false };

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    if (task.dueDate === tomorrowStr) return { text: `Tomorrow`, isOverdue: false };

    const d = new Date(task.dueDate + 'T00:00:00');
    return { text: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), isOverdue: false };
  };

  const deadline = getDeadlineText();
  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;
  const totalSubtasks = task.subtasks.length;

  const handleCheck = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (task.status !== 'completed') {
      sound.playChime();
      const rect = e.currentTarget.getBoundingClientRect();
      triggerConfetti({
        x: (rect.left + rect.width / 2) / window.innerWidth,
        y: (rect.top + rect.height / 2) / window.innerHeight,
      });
    } else {
      sound.playTap();
    }
    onToggleComplete(task.id);
  };

  return (
    <div
      ref={cardRef}
      className={`task-card ${task.status === 'completed' ? 'is-completed' : ''}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => {
        sound.playClick(750);
        onEdit(task);
      }}
      style={{
        padding: '18px 22px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        cursor: 'pointer',
        borderRadius: '16px',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        transition: 'all 0.25s var(--ease-spring)',
      }}
    >
      {/* Left Checkbox & Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
        <button
          className={`custom-checkbox ${task.status === 'completed' ? 'checked' : ''}`}
          onClick={handleCheck}
          style={{ width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0 }}
          aria-label={task.status === 'completed' ? 'Mark active' : 'Mark complete'}
        >
          {task.status === 'completed' && <Check size={12} strokeWidth={3} />}
        </button>

        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontSize: '15px',
                fontWeight: 600,
                color: task.status === 'completed' ? 'var(--text-subtle)' : 'var(--text-primary)',
                textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {task.title}
            </span>

            {task.pinned && (
              <Pin size={11} fill="var(--accent-terracotta)" color="var(--accent-terracotta)" />
            )}
          </div>

          {task.description && (
            <p
              style={{
                fontSize: '12.5px',
                color: 'var(--text-muted)',
                marginTop: '2px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '450px',
              }}
            >
              {task.description}
            </p>
          )}
        </div>
      </div>

      {/* Right Metadata & Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
        {/* Subtask count if any */}
        {totalSubtasks > 0 && (
          <span
            className="font-mono"
            style={{ fontSize: '11px', color: 'var(--text-subtle)' }}
          >
            {completedSubtasks}/{totalSubtasks}
          </span>
        )}

        {/* Category & Subcategory */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: category?.color || 'var(--text-subtle)',
            }}
          />
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>
            {task.category}
            {task.subcategory && (
              <span style={{ opacity: 0.65 }}> / {task.subcategory}</span>
            )}
          </span>
        </div>

        {/* Deadline */}
        {deadline && (
          <span
            className="font-mono"
            style={{
              fontSize: '11.5px',
              color: deadline.isOverdue ? 'var(--accent-crimson)' : 'var(--text-subtle)',
              fontWeight: deadline.isOverdue ? 700 : 500,
            }}
          >
            {deadline.text}
          </span>
        )}

        {/* Quick Pin / Trash Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              sound.playTap();
              onTogglePin(task.id);
            }}
            style={{
              padding: '6px',
              color: task.pinned ? 'var(--accent-terracotta)' : 'var(--text-subtle)',
              opacity: task.pinned ? 1 : 0.4,
            }}
            title={task.pinned ? 'Unpin' : 'Pin'}
          >
            <Pin size={13} fill={task.pinned ? 'currentColor' : 'none'} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              sound.playTap();
              onDelete(task.id);
            }}
            style={{ padding: '6px', color: 'var(--text-subtle)', opacity: 0.4 }}
            title="Delete"
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-crimson)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-subtle)')}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};
