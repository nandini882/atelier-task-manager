import React, { useState, useEffect } from 'react';
import { 
  X, 
  Trash2,
  Plus
} from 'lucide-react';
import type { Task, ProjectCategory, TaskPriority, EisenhowerQuadrant, Subtask } from '../types/task';
import { sound } from '../utils/audio';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Partial<Task>) => void;
  taskToEdit?: Task | null;
  categories: ProjectCategory[];
  onAddCategory?: (cat: ProjectCategory) => void;
  onAddSubcategory?: (categoryId: string, subcategoryName: string) => void;
  initialCategory?: string;
  initialDate?: string;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  taskToEdit,
  categories,
  onAddCategory,
  onAddSubcategory,
  initialCategory,
  initialDate,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [eisenhower, setEisenhower] = useState<EisenhowerQuadrant>('schedule');
  const [estimatedMinutes, setEstimatedMinutes] = useState(45);
  const [pinned, setPinned] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  // Inline Category / Subcategory creation states
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isCreatingSubcategory, setIsCreatingSubcategory] = useState(false);
  const [newSubcategoryName, setNewSubcategoryName] = useState('');

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setCategory(taskToEdit.category || (categories[0]?.name ?? ''));
      setSubcategory(taskToEdit.subcategory || '');
      setPriority(taskToEdit.priority);
      setDueDate(taskToEdit.dueDate || '');
      setDueTime(taskToEdit.dueTime || '');
      setEisenhower(taskToEdit.eisenhower || 'schedule');
      setEstimatedMinutes(taskToEdit.estimatedMinutes || 45);
      setPinned(taskToEdit.pinned || false);
      setTags(taskToEdit.tags || []);
      setSubtasks(taskToEdit.subtasks || []);
    } else {
      const today = new Date().toISOString().split('T')[0];
      setTitle('');
      setDescription('');
      const defaultCat = initialCategory || (categories[0]?.name ?? 'General');
      setCategory(defaultCat);
      setSubcategory('');
      setPriority('medium');
      setDueDate(initialDate || today);
      setDueTime('');
      setEisenhower('schedule');
      setEstimatedMinutes(45);
      setPinned(false);
      setTags([]);
      setSubtasks([]);
    }
    setIsCreatingCategory(false);
    setIsCreatingSubcategory(false);
  }, [taskToEdit, isOpen, initialCategory, initialDate, categories]);

  if (!isOpen) return null;

  const currentCategoryObj = categories.find(
    (c) => c.name.toLowerCase() === category.toLowerCase()
  );
  const availableSubcategories = currentCategoryObj?.subcategories || [];

  const handleCreateCategoryInline = () => {
    if (!newCategoryName.trim()) return;
    const catName = newCategoryName.trim();
    if (onAddCategory) {
      onAddCategory({
        id: `cat-${Date.now()}`,
        name: catName,
        color: '#E26D5C',
        subcategories: [],
      });
    }
    setCategory(catName);
    setNewCategoryName('');
    setIsCreatingCategory(false);
    sound.playTap();
  };

  const handleCreateSubcategoryInline = () => {
    if (!newSubcategoryName.trim()) return;
    const subcatName = newSubcategoryName.trim();
    if (currentCategoryObj && onAddSubcategory) {
      onAddSubcategory(currentCategoryObj.id, subcatName);
    }
    setSubcategory(subcatName);
    setNewSubcategoryName('');
    setIsCreatingSubcategory(false);
    sound.playTap();
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(newTagInput.trim())) {
        sound.playTap();
        setTags([...tags, newTagInput.trim()]);
      }
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    sound.playTap();
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    sound.playTap();
    const newSub: Subtask = {
      id: `sub-${Date.now()}`,
      title: newSubtaskTitle.trim(),
      completed: false,
    };
    setSubtasks([...subtasks, newSub]);
    setNewSubtaskTitle('');
  };

  const handleToggleSubtask = (subId: string) => {
    sound.playTap();
    setSubtasks(
      subtasks.map((s) => (s.id === subId ? { ...s, completed: !s.completed } : s))
    );
  };

  const handleRemoveSubtask = (subId: string) => {
    sound.playTap();
    setSubtasks(subtasks.filter((s) => s.id !== subId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    sound.playClick(900);
    onSave({
      id: taskToEdit?.id,
      title: title.trim(),
      description: description.trim(),
      category: category.trim() || 'General',
      subcategory: subcategory.trim() || undefined,
      priority,
      dueDate,
      dueTime: dueTime || undefined,
      eisenhower,
      estimatedMinutes,
      pinned,
      tags,
      subtasks,
      status: taskToEdit?.status || 'backlog',
    });
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div 
          style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '20px',
            paddingBottom: '14px',
            borderBottom: '1px solid var(--border-subtle)'
          }}
        >
          <div>
            <div className="font-mono" style={{ fontSize: '11px', color: 'var(--accent-terracotta)', letterSpacing: '0.08em' }}>
              {taskToEdit ? 'REFINE INITIATIVE' : 'NEW INITIATIVE'}
            </div>
            <h2 className="font-display" style={{ fontSize: '20px', fontWeight: 700 }}>
              {taskToEdit ? 'Edit Task' : 'Create Task'}
            </h2>
          </div>

          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'var(--tag-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Title */}
          <div>
            <label className="font-mono" style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-subtle)', display: 'block', marginBottom: '6px' }}>
              Title *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '12px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                fontSize: '15px',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          {/* Description */}
          <div>
            <label className="font-mono" style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-subtle)', display: 'block', marginBottom: '6px' }}>
              Notes & Details
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional context, links, or notes..."
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '12px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                fontSize: '13.5px',
                color: 'var(--text-primary)',
                resize: 'vertical',
              }}
            />
          </div>

          {/* Category & Subcategory Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
            {/* Category / Group */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="font-mono" style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-subtle)' }}>
                  Group / Category
                </label>
                <button
                  type="button"
                  onClick={() => setIsCreatingCategory(!isCreatingCategory)}
                  className="zh-link font-mono"
                  style={{ fontSize: '10.5px', color: 'var(--accent-terracotta)' }}
                >
                  {isCreatingCategory ? 'Cancel' : '+ New Group'}
                </button>
              </div>

              {isCreatingCategory ? (
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input
                    type="text"
                    autoFocus
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="New group name..."
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--accent-terracotta)',
                      fontSize: '13px',
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleCreateCategoryInline();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleCreateCategoryInline}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: 'var(--text-primary)',
                      color: 'var(--bg-primary)',
                      fontSize: '12px',
                      fontWeight: 600,
                    }}
                  >
                    Add
                  </button>
                </div>
              ) : (
                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setSubcategory('');
                  }}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '10px',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-color)',
                    fontSize: '13px',
                    color: 'var(--text-primary)',
                  }}
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                  {categories.length === 0 && (
                    <option value="General">General</option>
                  )}
                  {taskToEdit && !categories.some(c => c.name === taskToEdit.category) && (
                    <option value={taskToEdit.category}>{taskToEdit.category}</option>
                  )}
                </select>
              )}
            </div>

            {/* Subcategory */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="font-mono" style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-subtle)' }}>
                  Subcategory
                </label>
                <button
                  type="button"
                  onClick={() => setIsCreatingSubcategory(!isCreatingSubcategory)}
                  className="zh-link font-mono"
                  style={{ fontSize: '10.5px', color: 'var(--accent-terracotta)' }}
                >
                  {isCreatingSubcategory ? 'Cancel' : '+ New Subcat'}
                </button>
              </div>

              {isCreatingSubcategory ? (
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input
                    type="text"
                    autoFocus
                    value={newSubcategoryName}
                    onChange={(e) => setNewSubcategoryName(e.target.value)}
                    placeholder="New subcategory name..."
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--accent-terracotta)',
                      fontSize: '13px',
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleCreateSubcategoryInline();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleCreateSubcategoryInline}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: 'var(--text-primary)',
                      color: 'var(--bg-primary)',
                      fontSize: '12px',
                      fontWeight: 600,
                    }}
                  >
                    Add
                  </button>
                </div>
              ) : (
                <select
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '10px',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-color)',
                    fontSize: '13px',
                    color: 'var(--text-primary)',
                  }}
                >
                  <option value="">None (Primary Group)</option>
                  {availableSubcategories.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                  {taskToEdit?.subcategory && !availableSubcategories.includes(taskToEdit.subcategory) && (
                    <option value={taskToEdit.subcategory}>{taskToEdit.subcategory}</option>
                  )}
                </select>
              )}
            </div>
          </div>

          {/* Priority & Eisenhower Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
            <div>
              <label className="font-mono" style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-subtle)', display: 'block', marginBottom: '6px' }}>
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  fontSize: '13px',
                }}
              >
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label className="font-mono" style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-subtle)', display: 'block', marginBottom: '6px' }}>
                Eisenhower Quadrant
              </label>
              <select
                value={eisenhower}
                onChange={(e) => setEisenhower(e.target.value as EisenhowerQuadrant)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  fontSize: '13px',
                }}
              >
                <option value="do_first">1. Do First</option>
                <option value="schedule">2. Schedule</option>
                <option value="delegate">3. Delegate</option>
                <option value="backlog">4. Backlog</option>
              </select>
            </div>
          </div>

          {/* Due Date & Time */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
            <div>
              <label className="font-mono" style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-subtle)', display: 'block', marginBottom: '6px' }}>
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  fontSize: '13px',
                }}
              />
            </div>

            <div>
              <label className="font-mono" style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-subtle)', display: 'block', marginBottom: '6px' }}>
                Due Time (Optional)
              </label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  fontSize: '13px',
                }}
              />
            </div>
          </div>

          {/* Subtasks */}
          <div>
            <label className="font-mono" style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-subtle)', display: 'block', marginBottom: '8px' }}>
              Subtasks
            </label>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '8px' }}>
              {subtasks.map((sub) => (
                <div
                  key={sub.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    background: 'var(--tag-bg)',
                  }}
                >
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flex: 1 }}>
                    <input
                      type="checkbox"
                      checked={sub.completed}
                      onChange={() => handleToggleSubtask(sub.id)}
                    />
                    <span style={{ fontSize: '13px', textDecoration: sub.completed ? 'line-through' : 'none' }}>
                      {sub.title}
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtask(sub.id)}
                    style={{ color: 'var(--text-subtle)' }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                placeholder="+ Add subtask..."
                style={{
                  flex: 1,
                  padding: '7px 12px',
                  borderRadius: '8px',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  fontSize: '13px',
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask(e);
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                style={{
                  padding: '7px 12px',
                  borderRadius: '8px',
                  background: 'var(--tag-bg)',
                  fontSize: '12px',
                  fontWeight: 600,
                }}
              >
                Add
              </button>
            </div>
          </div>

          {/* Pinned */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={pinned}
              onChange={(e) => setPinned(e.target.checked)}
            />
            <span style={{ fontSize: '13px', fontWeight: 500 }}>
              Pin to Top of Stream
            </span>
          </label>

          {/* Actions */}
          <div 
            style={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              gap: '10px', 
              marginTop: '8px',
              paddingTop: '14px',
              borderTop: '1px solid var(--border-subtle)' 
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px 18px',
                borderRadius: '999px',
                background: 'var(--tag-bg)',
                fontSize: '13px',
                fontWeight: 600,
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              style={{
                padding: '8px 22px',
                borderRadius: '999px',
                background: 'var(--accent-terracotta)',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 700,
              }}
            >
              {taskToEdit ? 'Save' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
