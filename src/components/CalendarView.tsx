import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus
} from 'lucide-react';
import type { Task, ProjectCategory } from '../types/task';
import { TaskCard } from './TaskCard';
import { sound } from '../utils/audio';

interface CalendarViewProps {
  tasks: Task[];
  categories: ProjectCategory[];
  onToggleComplete: (taskId: string) => void;
  onTogglePin: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onOpenNewTaskModalForDate: (dateStr: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  tasks,
  categories,
  onToggleComplete,
  onTogglePin,
  onDelete,
  onEdit,
  onOpenNewTaskModalForDate,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const prevMonth = () => {
    sound.playClick(600);
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    sound.playClick(800);
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const jumpToToday = () => {
    sound.playTap();
    const now = new Date();
    setCurrentDate(now);
    setSelectedDateStr(now.toISOString().split('T')[0]);
  };

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const startOffset = (firstDayOfMonth + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const todayStr = new Date().toISOString().split('T')[0];

  const calendarCells: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

  for (let i = startOffset - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const prevDate = new Date(year, month - 1, d);
    calendarCells.push({ dateStr: prevDate.toISOString().split('T')[0], dayNum: d, isCurrentMonth: false });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const mStr = String(month + 1).padStart(2, '0');
    const dStr = String(d).padStart(2, '0');
    calendarCells.push({ dateStr: `${year}-${mStr}-${dStr}`, dayNum: d, isCurrentMonth: true });
  }

  const remainingCells = 42 - calendarCells.length;
  for (let d = 1; d <= remainingCells; d++) {
    const nextDate = new Date(year, month + 1, d);
    calendarCells.push({ dateStr: nextDate.toISOString().split('T')[0], dayNum: d, isCurrentMonth: false });
  }

  const selectedDayTasks = tasks.filter((t) => t.dueDate === selectedDateStr);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Month Grid Card */}
      <div 
        style={{ 
          background: 'var(--bg-surface)', 
          border: '1px solid var(--border-color)', 
          borderRadius: '24px', 
          padding: 'clamp(20px, 3vw, 32px)',
          boxShadow: 'var(--shadow-card)'
        }}
      >
        {/* Month Header */}
        <div 
          style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '20px' 
          }}
        >
          <h2 className="font-display" style={{ fontSize: '24px', fontWeight: 600 }}>
            {monthNames[month]} <span className="font-editorial">{year}</span>
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={jumpToToday}
              className="zh-link font-mono"
              style={{
                fontSize: '11.5px',
                padding: '5px 12px',
                borderRadius: '999px',
                background: 'var(--tag-bg)',
              }}
            >
              Today
            </button>

            <button
              onClick={prevMonth}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'var(--tag-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Previous month"
            >
              <ChevronLeft size={15} />
            </button>

            <button
              onClick={nextMonth}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'var(--tag-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Next month"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>

        {/* Days Header */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', marginBottom: '6px' }}>
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <div key={day} className="calendar-day-header" style={{ padding: '6px 0', fontSize: '11px' }}>
              {day}
            </div>
          ))}
        </div>

        {/* Cells Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
          {calendarCells.map((cell, idx) => {
            const dayTasks = tasks.filter((t) => t.dueDate === cell.dateStr);
            const isToday = cell.dateStr === todayStr;
            const isSelected = cell.dateStr === selectedDateStr;

            return (
              <div
                key={idx}
                className={`calendar-day-cell ${cell.isCurrentMonth ? '' : 'not-current-month'} ${
                  isToday ? 'is-today' : ''
                } ${isSelected ? 'is-selected' : ''}`}
                onClick={() => {
                  sound.playClick(750);
                  setSelectedDateStr(cell.dateStr);
                }}
                style={{
                  minHeight: '70px',
                  aspectRatio: 'unset',
                  padding: '8px 10px',
                  borderRadius: '12px',
                  border: isSelected ? '1px solid var(--text-primary)' : isToday ? '1px solid var(--accent-terracotta)' : '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="calendar-day-number" style={{ fontSize: '12px', fontWeight: isToday ? 700 : 500 }}>
                    {cell.dayNum}
                  </span>
                  {dayTasks.length > 0 && (
                    <span 
                      className="font-mono" 
                      style={{ fontSize: '10px', color: 'var(--text-subtle)' }}
                    >
                      {dayTasks.length}
                    </span>
                  )}
                </div>

                {/* Heat dots */}
                <div style={{ display: 'flex', gap: '3px', marginTop: '6px', flexWrap: 'wrap' }}>
                  {dayTasks.slice(0, 4).map((t) => (
                    <div
                      key={t.id}
                      style={{
                        width: '5px',
                        height: '5px',
                        borderRadius: '50%',
                        backgroundColor: t.status === 'completed' 
                          ? 'var(--accent-sage)' 
                          : t.priority === 'urgent' 
                            ? 'var(--accent-crimson)' 
                            : 'var(--accent-terracotta)',
                      }}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Agenda */}
      <div 
        style={{ 
          background: 'var(--bg-surface)', 
          border: '1px solid var(--border-color)', 
          borderRadius: '24px', 
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
      >
        <div 
          style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            paddingBottom: '12px',
            borderBottom: '1px solid var(--border-subtle)'
          }}
        >
          <div>
            <span className="font-mono" style={{ fontSize: '11px', color: 'var(--text-subtle)', textTransform: 'uppercase' }}>
              SCHEDULED AGENDA
            </span>
            <h3 className="font-display" style={{ fontSize: '18px', fontWeight: 600 }}>
              {new Date(selectedDateStr + 'T00:00:00').toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </h3>
          </div>

          <button
            onClick={() => {
              sound.playTap();
              onOpenNewTaskModalForDate(selectedDateStr);
            }}
            className="zh-link font-mono"
            style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <Plus size={13} />
            <span>Schedule on Date</span>
          </button>
        </div>

        {selectedDayTasks.length === 0 ? (
          <p style={{ color: 'var(--text-subtle)', fontSize: '13px', padding: '16px 0', textAlign: 'center' }}>
            No tasks scheduled for this day.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {selectedDayTasks.map((task) => (
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
    </div>
  );
};
