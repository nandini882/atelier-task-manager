import { CheckCircle, Clock, PlayCircle, Eye } from 'lucide-react';
import type { Task, ProjectCategory, TaskStatus } from '../types/task';
import { TaskCard } from './TaskCard';
import { sound } from '../utils/audio';

interface KanbanViewProps {
  tasks: Task[];
  categories: ProjectCategory[];
  onToggleComplete: (taskId: string) => void;
  onTogglePin: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onUpdateStatus: (taskId: string, newStatus: TaskStatus) => void;
}

export const KanbanView: React.FC<KanbanViewProps> = ({
  tasks,
  categories,
  onToggleComplete,
  onTogglePin,
  onDelete,
  onEdit,
  onUpdateStatus,
}) => {
  const columns: { status: TaskStatus; title: string; icon: React.ReactNode }[] = [
    { status: 'backlog', title: 'Backlog', icon: <Clock size={13} /> },
    { status: 'in_progress', title: 'In Progress', icon: <PlayCircle size={13} /> },
    { status: 'in_review', title: 'Review', icon: <Eye size={13} /> },
    { status: 'completed', title: 'Completed', icon: <CheckCircle size={13} /> },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
        <h2 className="font-display" style={{ fontSize: '20px', fontWeight: 600 }}>
          Workflow Pipeline
        </h2>
        <span className="font-mono" style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>
          ({tasks.length} total)
        </span>
      </div>

      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', 
          gap: '16px',
          alignItems: 'start'
        }}
      >
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.status);

          return (
            <div
              key={col.status}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: '20px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                minHeight: '320px',
              }}
            >
              {/* Header */}
              <div 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  paddingBottom: '10px',
                  borderBottom: '1px solid var(--border-subtle)' 
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{col.icon}</span>
                  <span style={{ fontSize: '13.5px', fontWeight: 600 }}>{col.title}</span>
                </div>
                <span className="font-mono" style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>
                  {colTasks.length}
                </span>
              </div>

              {/* Tasks List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                {colTasks.length === 0 ? (
                  <div style={{ margin: 'auto', color: 'var(--text-subtle)', fontSize: '12px' }}>
                    Empty
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <div key={task.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <TaskCard
                        task={task}
                        category={categories.find((c) => c.name.toLowerCase() === task.category.toLowerCase())}
                        onToggleComplete={onToggleComplete}
                        onTogglePin={onTogglePin}
                        onDelete={onDelete}
                        onEdit={onEdit}
                      />

                      {/* Advance action */}
                      {col.status !== 'completed' && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 4px' }}>
                          <button
                            onClick={() => {
                              sound.playClick(850);
                              const nextMap: Record<TaskStatus, TaskStatus> = {
                                backlog: 'in_progress',
                                in_progress: 'in_review',
                                in_review: 'completed',
                                completed: 'completed',
                              };
                              onUpdateStatus(task.id, nextMap[col.status]);
                            }}
                            className="zh-link font-mono"
                            style={{ fontSize: '10.5px', color: 'var(--text-subtle)' }}
                          >
                            Advance stage →
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
