import React, { useEffect, useState } from 'react';
import { 
  Sparkles, 
  Calendar as CalendarIcon, 
  Grid2X2, 
  Columns3, 
  Target, 
  Plus, 
  Moon, 
  Sun, 
  Clock, 
  Sliders
} from 'lucide-react';
import type { ActiveView, UserProfile } from '../types/task';
import { sound } from '../utils/audio';

interface HeaderNavProps {
  activeView: ActiveView;
  onViewChange: (view: ActiveView) => void;
  userProfile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onOpenNewTaskModal: () => void;
  onOpenProfileModal: () => void;
  taskStats: { total: number; dueToday: number; completedToday: number };
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  activeView,
  onViewChange,
  userProfile,
  onUpdateProfile,
  onOpenNewTaskModal,
  onOpenProfileModal,
}) => {
  const [timeString, setTimeString] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      if (userProfile.clockMode === 'paris') {
        const parisTime = now.toLocaleTimeString('en-US', {
          timeZone: 'Europe/Paris',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });
        setTimeString(`PARIS ${parisTime}`);
      } else {
        const localTime = now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });
        setTimeString(`LOCAL ${localTime}`);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [userProfile.clockMode]);

  const toggleSound = () => {
    const nextState = !userProfile.soundEnabled;
    onUpdateProfile({ soundEnabled: nextState });
    sound.setEnabled(nextState);
    if (nextState) sound.playClick(960);
  };

  const toggleTheme = () => {
    const nextTheme = userProfile.theme === 'cream' ? 'dark' : 'cream';
    onUpdateProfile({ theme: nextTheme });
    sound.playTap();
  };

  const toggleClockMode = () => {
    const nextClock = userProfile.clockMode === 'paris' ? 'local' : 'paris';
    onUpdateProfile({ clockMode: nextClock });
    sound.playClick(720);
  };

  const navItems: { view: ActiveView; label: string; icon: React.ReactNode }[] = [
    { view: 'stream', label: 'Stream', icon: <Sparkles size={14} /> },
    { view: 'calendar', label: 'Calendar', icon: <CalendarIcon size={14} /> },
    { view: 'grouping', label: 'Matrix', icon: <Grid2X2 size={14} /> },
    { view: 'pipeline', label: 'Pipeline', icon: <Columns3 size={14} /> },
    { view: 'focus', label: 'Focus', icon: <Target size={14} /> },
  ];

  return (
    <header className="site-header">
      <nav className="site-capsule-nav" aria-label="Main Navigation">
        {/* Monogram */}
        <div 
          className="nav-brand zh-link" 
          onClick={() => {
            sound.playClick(1000);
            onViewChange('stream');
          }}
          title="Atelier"
          style={{ cursor: 'pointer' }}
        >
          <div className="nav-brand-mark">GZ</div>
        </div>

        {/* View Switcher Tabs */}
        <div className="nav-view-switcher">
          {navItems.map((item) => {
            const isActive = activeView === item.view;
            return (
              <button
                key={item.view}
                className={`nav-tab-btn ${isActive ? 'is-active' : ''}`}
                onClick={() => {
                  sound.playClick(isActive ? 700 : 880);
                  onViewChange(item.view);
                }}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Time Button */}
          <button 
            className="zh-link font-mono" 
            style={{ 
              fontSize: '11px', 
              padding: '5px 9px', 
              borderRadius: '999px',
              background: 'var(--tag-bg)',
              letterSpacing: '0.04em'
            }}
            onClick={toggleClockMode}
            title="Toggle Paris/Local time"
          >
            <Clock size={11} style={{ opacity: 0.7 }} />
            <span>{timeString}</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            style={{
              padding: '6px 8px',
              borderRadius: '999px',
              color: userProfile.soundEnabled ? 'var(--accent-terracotta)' : 'var(--text-subtle)',
            }}
            title={userProfile.soundEnabled ? 'Mute audio' : 'Enable audio'}
          >
            <div className={`sound-wave-bars ${userProfile.soundEnabled ? '' : 'is-muted'}`}>
              <div className="sound-bar sound-bar-1" />
              <div className="sound-bar sound-bar-2" />
              <div className="sound-bar sound-bar-3" />
            </div>
          </button>

          {/* Theme Button */}
          <button
            onClick={toggleTheme}
            style={{
              padding: '6px 8px',
              borderRadius: '999px',
              color: 'var(--text-primary)',
            }}
            title="Toggle theme"
          >
            {userProfile.theme === 'cream' ? (
              <Moon size={14} />
            ) : (
              <Sun size={14} style={{ color: 'var(--accent-saffron)' }} />
            )}
          </button>

          {/* New Task Pill */}
          <button
            onClick={() => {
              sound.playTap();
              onOpenNewTaskModal();
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '6px 14px',
              borderRadius: '999px',
              background: 'var(--text-primary)',
              color: 'var(--bg-primary)',
              fontWeight: 600,
              fontSize: '12.5px',
            }}
            title="New task [N]"
          >
            <Plus size={14} strokeWidth={2.5} />
            <span>New</span>
          </button>

          {/* Profile Button */}
          <button
            onClick={() => {
              sound.playClick(600);
              onOpenProfileModal();
            }}
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              background: 'var(--tag-bg)',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Settings & Persona"
          >
            <Sliders size={13} />
          </button>
        </div>
      </nav>
    </header>
  );
};
