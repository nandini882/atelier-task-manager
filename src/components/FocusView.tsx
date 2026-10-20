import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Check } from 'lucide-react';
import type { Task } from '../types/task';
import { sound } from '../utils/audio';
import { triggerConfetti } from '../utils/particles';

interface FocusViewProps {
  tasks: Task[];
  onToggleComplete: (taskId: string) => void;
}

export const FocusView: React.FC<FocusViewProps> = ({ tasks, onToggleComplete }) => {
  const activeTasks = tasks.filter((t) => t.status !== 'completed');
  const [selectedTaskId, setSelectedTaskId] = useState<string>(
    activeTasks[0]?.id || ''
  );

  const [durationMinutes, setDurationMinutes] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(2);

  const currentTask = tasks.find((t) => t.id === selectedTaskId);

  useEffect(() => {
    let timer: number;
    if (isRunning && secondsLeft > 0) {
      timer = window.setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isRunning) {
      setIsRunning(false);
      sound.playChime();
      triggerConfetti();
      setCompletedSessions((prev) => prev + 1);
    }
    return () => clearInterval(timer);
  }, [isRunning, secondsLeft]);

  const toggleTimer = () => {
    sound.playClick(isRunning ? 600 : 880);
    setIsRunning(!isRunning);
  };

  const resetTimer = (mins: number = durationMinutes) => {
    sound.playTap();
    setIsRunning(false);
    setDurationMinutes(mins);
    setSecondsLeft(mins * 60);
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const progressPercent = ((durationMinutes * 60 - secondsLeft) / (durationMinutes * 60)) * 100;

  return (
    <div 
      style={{ 
        maxWidth: '840px', 
        margin: '0 auto', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        textAlign: 'center' 
      }}
    >
      <div 
        className="font-mono" 
        style={{ 
          fontSize: '11px', 
          color: 'var(--accent-terracotta)', 
          letterSpacing: '0.12em', 
          textTransform: 'uppercase',
          marginBottom: '8px' 
        }}
      >
        MONASTIC FOCUS & DEEP FLOW
      </div>

      <h2 className="font-display" style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 700, marginBottom: '28px' }}>
        Single-Task Immersion
      </h2>

      {/* Task Selector Card */}
      <div 
        style={{ 
          width: '100%', 
          background: 'var(--bg-surface)', 
          border: '1px solid var(--border-color)', 
          borderRadius: 'var(--border-radius-card)', 
          padding: '20px', 
          marginBottom: '36px',
          boxShadow: 'var(--shadow-card)' 
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'left', flex: 1, minWidth: '240px' }}>
            <div className="font-mono" style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>
              CURRENT FOCUS TARGET
            </div>
            {currentTask ? (
              <h3 className="font-display" style={{ fontSize: '18px', fontWeight: 600, marginTop: '4px' }}>
                {currentTask.title}
              </h3>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No active tasks available</p>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <select
              value={selectedTaskId}
              onChange={(e) => {
                sound.playClick(700);
                setSelectedTaskId(e.target.value);
              }}
              style={{
                padding: '8px 14px',
                borderRadius: '999px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                fontSize: '13px',
                color: 'var(--text-primary)',
              }}
            >
              {activeTasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>

            {currentTask && (
              <button
                onClick={() => {
                  sound.playChime();
                  triggerConfetti();
                  onToggleComplete(currentTask.id);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: '999px',
                  background: 'var(--accent-sage)',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: 600,
                }}
              >
                <Check size={14} strokeWidth={3} />
                <span>Mark Done</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Circular Flow Dial / Visual Ring */}
      <div 
        style={{ 
          position: 'relative', 
          width: '280px', 
          height: '280px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          marginBottom: '32px' 
        }}
      >
        <svg width="280" height="280" style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx="140"
            cy="140"
            r="120"
            stroke="var(--border-subtle)"
            strokeWidth="8"
            fill="transparent"
          />
          <circle
            cx="140"
            cy="140"
            r="120"
            stroke="var(--accent-terracotta)"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={2 * Math.PI * 120}
            strokeDashoffset={2 * Math.PI * 120 * (1 - progressPercent / 100)}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />
        </svg>

        <div style={{ position: 'absolute', textAlign: 'center' }}>
          <div className="font-mono" style={{ fontSize: '56px', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1 }}>
            {timeFormatted}
          </div>
          <div className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px', textTransform: 'uppercase' }}>
            {isRunning ? 'FLOW SESSION IN PROGRESS' : 'PAUSED / READY'}
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <button
          onClick={toggleTimer}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '14px 32px',
            borderRadius: '999px',
            background: 'var(--accent-terracotta)',
            color: '#fff',
            fontSize: '16px',
            fontWeight: 700,
            boxShadow: '0 8px 24px rgba(226, 109, 92, 0.35)',
            transform: 'scale(1)',
            transition: 'transform 0.2s ease',
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.96)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          {isRunning ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
          <span>{isRunning ? 'Pause' : 'Start Flow'}</span>
        </button>

        <button
          onClick={() => resetTimer()}
          style={{
            padding: '14px',
            borderRadius: '50%',
            background: 'var(--tag-bg)',
            color: 'var(--text-primary)',
          }}
          title="Reset timer"
        >
          <RotateCcw size={18} />
        </button>
      </div>

      {/* Preset Buttons */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {[
          { label: '25m Sprint', mins: 25 },
          { label: '50m Deep Craft', mins: 50 },
          { label: '5m Breather', mins: 5 },
        ].map((preset) => (
          <button
            key={preset.mins}
            onClick={() => resetTimer(preset.mins)}
            style={{
              padding: '6px 14px',
              borderRadius: '999px',
              background: durationMinutes === preset.mins ? 'var(--text-primary)' : 'var(--tag-bg)',
              color: durationMinutes === preset.mins ? 'var(--bg-primary)' : 'var(--text-muted)',
              fontSize: '12px',
              fontWeight: 600,
            }}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Flow stats */}
      <div className="font-mono" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
        TODAY'S IMMERSION: {completedSessions} SESSIONS COMPLETED ({completedSessions * 25} MINS DEEP WORK)
      </div>
    </div>
  );
};
