import React, { useState } from 'react';
import { 
  FolderKanban, 
  Grid2X2, 
  Clock, 
  Plus,
  Tag,
  FolderPlus
} from 'lucide-react';
import type { Task, ProjectCategory, EisenhowerQuadrant } from '../types/task';
import { TaskCard } from './TaskCard';
import { sound } from '../utils/audio';

interface GroupingViewProps {
  tasks: Task[];
  categories: ProjectCategory[];
  onToggleComplete: (taskId: string) => void;
  onTogglePin: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onUpdateTaskQuadrant: (taskId: string, quadrant: EisenhowerQuadrant) => void;
  onOpenNewTaskModalWithCategory?: (category: string, subcat?: string) => void;
  onOpenCategoryManager?: () => void;
  onAddSubcategory?: (categoryId: string, subcategoryName: string) => void;
}

export const GroupingView: React.FC<GroupingViewProps> = ({
  tasks,
  categories,
  onToggleComplete,
  onTogglePin,
  onDelete,
  onEdit,
  onOpenNewTaskModalWithCategory,
  onOpenCategoryManager,
  onAddSubcategory,
}) => {
  const [groupMode, setGroupMode] = useState<'eisenhower' | 'stream' | 'horizon'>('stream');
  const [newSubcatInputs, setNewSubcatInputs] = useState<Record<string, string>>({});

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const in7Days = new Date();
  in7Days.setDate(in7Days.getDate() + 7);
  const in7DaysStr = in7Days.toISOString().split('T')[0];

  const handleQuickAddSubcat = (categoryId: string) => {
    const val = (newSubcatInputs[categoryId] || '').trim();
    if (!val || !onAddSubcategory) return;
    sound.playTap();
    onAddSubcategory(categoryId, val);
    setNewSubcatInputs((prev) => ({ ...prev, [categoryId]: '' }));
  };

  // Extract all categories, including any custom ones present on user's tasks
  const allCategoryNames = Array.from(
    new Set([
      ...categories.map((c) => c.name),
      ...tasks.map((t) => t.category).filter(Boolean),
    ])
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header and Switcher */}
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap', 
          gap: '12px' 
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
          <h2 className="font-display" style={{ fontSize: '20px', fontWeight: 600 }}>
            {groupMode === 'eisenhower' && 'Eisenhower Decision Matrix'}
            {groupMode === 'stream' && 'Groups & Subcategories'}
            {groupMode === 'horizon' && 'Deadlines'}
          </h2>
          <span className="font-mono" style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>
            ({tasks.length} initiatives)
          </span>
        </div>

        {/* Minimal pill tabs */}
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            background: 'var(--tag-bg)', 
            borderRadius: '999px', 
            padding: '3px' 
          }}
        >
          {[
            { id: 'stream', label: 'Groups & Subcats', icon: <FolderKanban size={13} /> },
            { id: 'eisenhower', label: 'Matrix', icon: <Grid2X2 size={13} /> },
            { id: 'horizon', label: 'Horizons', icon: <Clock size={13} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                sound.playClick(750);
                setGroupMode(tab.id as 'eisenhower' | 'stream' | 'horizon');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 14px',
                borderRadius: '999px',
                fontSize: '12.5px',
                fontWeight: groupMode === tab.id ? 600 : 400,
                background: groupMode === tab.id ? 'var(--bg-surface-elevated)' : 'transparent',
                color: groupMode === tab.id ? 'var(--text-primary)' : 'var(--text-muted)',
                boxShadow: groupMode === tab.id ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 1. GROUPS & SUBCATEGORIES MODE */}
      {groupMode === 'stream' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {allCategoryNames.length === 0 ? (
            <div 
              style={{ 
                textAlign: 'center', 
                padding: '60px 20px', 
                borderRadius: '20px', 
                background: 'var(--bg-surface)', 
                border: '1px dashed var(--border-color)' 
              }}
            >
              <FolderPlus size={32} style={{ opacity: 0.4, marginBottom: '12px', color: 'var(--accent-terracotta)' }} />
              <h3 className="font-display" style={{ fontSize: '18px', fontWeight: 600, marginBottom: '6px' }}>
                No Groups Created Yet
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', marginBottom: '16px' }}>
                Create your first group to organize tasks into custom categories and nested subcategories.
              </p>
              {onOpenCategoryManager && (
                <button
                  onClick={() => {
                    sound.playTap();
                    onOpenCategoryManager();
                  }}
                  style={{
                    padding: '8px 20px',
                    borderRadius: '999px',
                    background: 'var(--text-primary)',
                    color: 'var(--bg-primary)',
                    fontSize: '13px',
                    fontWeight: 600,
                  }}
                >
                  + Create Group
                </button>
              )}
            </div>
          ) : (
            allCategoryNames.map((catName) => {
              const catObj = categories.find((c) => c.name.toLowerCase() === catName.toLowerCase());
              const catTasks = tasks.filter(
                (t) => t.category.toLowerCase() === catName.toLowerCase()
              );

              // Distinct subcategories present in this group
              const registeredSubcats = catObj?.subcategories || [];
              const taskSubcats = catTasks.map((t) => t.subcategory).filter(Boolean) as string[];
              const distinctSubcats = Array.from(new Set([...registeredSubcats, ...taskSubcats]));

              return (
                <div
                  key={catName}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '24px',
                    padding: '24px',
                    boxShadow: 'var(--shadow-card)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
                  }}
                >
                  {/* Category Header */}
                  <div 
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      paddingBottom: '12px',
                      borderBottom: '1px solid var(--border-subtle)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span 
                        style={{ 
                          width: '10px', 
                          height: '10px', 
                          borderRadius: '50%', 
                          backgroundColor: catObj?.color || 'var(--accent-terracotta)' 
                        }} 
                      />
                      <h3 className="font-display" style={{ fontSize: '18px', fontWeight: 600 }}>
                        {catName}
                      </h3>
                      <span className="font-mono" style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>
                        ({catTasks.length} tasks)
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {onOpenNewTaskModalWithCategory && (
                        <button
                          onClick={() => {
                            sound.playTap();
                            onOpenNewTaskModalWithCategory(catName);
                          }}
                          className="zh-link font-mono"
                          style={{ fontSize: '11.5px', color: 'var(--accent-terracotta)' }}
                        >
                          + Add Task
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Subcategory Clusters */}
                  {distinctSubcats.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                      {distinctSubcats.map((subcat) => {
                        const subcatTasks = catTasks.filter(
                          (t) => t.subcategory?.toLowerCase() === subcat.toLowerCase()
                        );

                        return (
                          <div key={subcat} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Tag size={11} style={{ opacity: 0.5 }} />
                                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                                  {subcat}
                                </span>
                                <span className="font-mono" style={{ fontSize: '10.5px', color: 'var(--text-subtle)' }}>
                                  ({subcatTasks.length})
                                </span>
                              </div>

                              {onOpenNewTaskModalWithCategory && (
                                <button
                                  onClick={() => {
                                    sound.playTap();
                                    onOpenNewTaskModalWithCategory(catName, subcat);
                                  }}
                                  className="zh-link font-mono"
                                  style={{ fontSize: '10.5px', color: 'var(--text-subtle)' }}
                                >
                                  + in {subcat}
                                </button>
                              )}
                            </div>

                            {subcatTasks.length === 0 ? (
                              <p style={{ color: 'var(--text-subtle)', fontSize: '12px', paddingLeft: '16px' }}>
                                No tasks assigned to this subcat.
                              </p>
                            ) : (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {subcatTasks.map((task) => (
                                  <TaskCard
                                    key={task.id}
                                    task={task}
                                    category={catObj}
                                    onToggleComplete={onToggleComplete}
                                    onTogglePin={onTogglePin}
                                    onDelete={onDelete}
                                    onEdit={onEdit}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* General Tasks with No Subcategory in this Group */}
                      {catTasks.filter((t) => !t.subcategory).length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-subtle)' }}>
                              General (No Subcat)
                            </span>
                            <span className="font-mono" style={{ fontSize: '10.5px', color: 'var(--text-subtle)' }}>
                              ({catTasks.filter((t) => !t.subcategory).length})
                            </span>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {catTasks
                              .filter((t) => !t.subcategory)
                              .map((task) => (
                                <TaskCard
                                  key={task.id}
                                  task={task}
                                  category={catObj}
                                  onToggleComplete={onToggleComplete}
                                  onTogglePin={onTogglePin}
                                  onDelete={onDelete}
                                  onEdit={onEdit}
                                />
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* If no subcategories exist in this group yet */
                    <div>
                      {catTasks.length === 0 ? (
                        <p style={{ color: 'var(--text-subtle)', fontSize: '13px', padding: '6px 0' }}>
                          No tasks in this group.
                        </p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {catTasks.map((task) => (
                            <TaskCard
                              key={task.id}
                              task={task}
                              category={catObj}
                              onToggleComplete={onToggleComplete}
                              onTogglePin={onTogglePin}
                              onDelete={onDelete}
                              onEdit={onEdit}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Add Subcategory input footer if category object exists */}
                  {catObj && onAddSubcategory && (
                    <div style={{ display: 'flex', gap: '6px', marginTop: '4px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
                      <input
                        type="text"
                        value={newSubcatInputs[catObj.id] || ''}
                        onChange={(e) => setNewSubcatInputs({ ...newSubcatInputs, [catObj.id]: e.target.value })}
                        placeholder={`+ Add new subcategory to ${catName}...`}
                        style={{
                          flex: 1,
                          padding: '6px 12px',
                          borderRadius: '8px',
                          background: 'var(--bg-input)',
                          border: '1px solid var(--border-subtle)',
                          fontSize: '12px',
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleQuickAddSubcat(catObj.id);
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleQuickAddSubcat(catObj.id)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '8px',
                          background: 'var(--tag-bg)',
                          fontSize: '12px',
                          fontWeight: 600,
                        }}
                      >
                        Add Subcat
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}

          {/* Quick Create Group Button */}
          {onOpenCategoryManager && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
              <button
                onClick={() => {
                  sound.playTap();
                  onOpenCategoryManager();
                }}
                className="zh-link font-mono"
                style={{
                  fontSize: '12px',
                  padding: '8px 18px',
                  borderRadius: '999px',
                  border: '1px dashed var(--border-color)',
                  color: 'var(--text-muted)'
                }}
              >
                + Manage or Add New Groups
              </button>
            </div>
          )}
        </div>
      )}

      {/* 2. EISENHOWER MATRIX */}
      {groupMode === 'eisenhower' && (
        <div 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
            gap: '16px' 
          }}
        >
          {[
            {
              quadrant: 'do_first' as EisenhowerQuadrant,
              title: '1. Do First',
              subtitle: 'Urgent & Important',
              accent: 'var(--accent-crimson)',
            },
            {
              quadrant: 'schedule' as EisenhowerQuadrant,
              title: '2. Schedule',
              subtitle: 'Important, Not Urgent',
              accent: 'var(--accent-terracotta)',
            },
            {
              quadrant: 'delegate' as EisenhowerQuadrant,
              title: '3. Delegate',
              subtitle: 'Urgent, Not Important',
              accent: 'var(--accent-saffron)',
            },
            {
              quadrant: 'backlog' as EisenhowerQuadrant,
              title: '4. Backlog',
              subtitle: 'Quiet reserve',
              accent: 'var(--text-subtle)',
            },
          ].map((q) => {
            const qTasks = tasks.filter((t) => t.eisenhower === q.quadrant);

            return (
              <div
                key={q.quadrant}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '20px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  minHeight: '260px',
                }}
              >
                <div 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    paddingBottom: '10px',
                    borderBottom: '1px solid var(--border-subtle)' 
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: q.accent }} />
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>{q.title}</span>
                    <span className="font-mono" style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>
                      · {q.subtitle}
                    </span>
                  </div>
                  <span className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {qTasks.length}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                  {qTasks.length === 0 ? (
                    <div style={{ margin: 'auto', color: 'var(--text-subtle)', fontSize: '12.5px' }}>
                      Clean quadrant
                    </div>
                  ) : (
                    qTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        category={categories.find((c) => c.name.toLowerCase() === task.category.toLowerCase())}
                        onToggleComplete={onToggleComplete}
                        onTogglePin={onTogglePin}
                        onDelete={onDelete}
                        onEdit={onEdit}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. HORIZONS */}
      {groupMode === 'horizon' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {[
            {
              id: 'overdue',
              title: 'Overdue',
              filter: (t: Task) => t.status !== 'completed' && t.dueDate < todayStr,
              accent: 'var(--accent-crimson)',
            },
            {
              id: 'today',
              title: 'Due Today',
              filter: (t: Task) => t.dueDate === todayStr,
              accent: 'var(--accent-peach)',
            },
            {
              id: 'tomorrow',
              title: 'Due Tomorrow',
              filter: (t: Task) => t.dueDate === tomorrowStr,
              accent: 'var(--accent-terracotta)',
            },
            {
              id: 'week',
              title: 'Next 7 Days',
              filter: (t: Task) => t.dueDate > tomorrowStr && t.dueDate <= in7DaysStr,
              accent: 'var(--accent-saffron)',
            },
            {
              id: 'later',
              title: 'Upcoming & Someday',
              filter: (t: Task) => !t.dueDate || t.dueDate > in7DaysStr,
              accent: 'var(--text-subtle)',
            },
          ].map((h) => {
            const hTasks = tasks.filter(h.filter);
            if (hTasks.length === 0 && h.id !== 'today' && h.id !== 'overdue') return null;

            return (
              <div key={h.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    fontSize: '13px', 
                    fontWeight: 600,
                    color: h.id === 'overdue' && hTasks.length > 0 ? 'var(--accent-crimson)' : 'var(--text-primary)',
                    paddingBottom: '4px',
                    borderBottom: '1px solid var(--border-subtle)'
                  }}
                >
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: h.accent }} />
                  <span>{h.title}</span>
                  <span className="font-mono" style={{ fontSize: '11px', color: 'var(--text-subtle)', fontWeight: 400 }}>
                    ({hTasks.length})
                  </span>
                </div>

                {hTasks.length === 0 ? (
                  <p style={{ color: 'var(--text-subtle)', fontSize: '12px', padding: '4px 0' }}>None</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {hTasks.map((task) => (
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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
