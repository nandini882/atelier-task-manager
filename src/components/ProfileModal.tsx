import React, { useState } from 'react';
import { X, Download, Upload, RotateCcw } from 'lucide-react';
import type { UserProfile, Task, ProjectCategory } from '../types/task';
import { sound } from '../utils/audio';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  tasks: Task[];
  categories: ProjectCategory[];
  onImportData: (data: { tasks: Task[]; categories?: ProjectCategory[]; userProfile?: UserProfile }) => void;
  onResetData: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onSaveProfile,
  tasks,
  categories,
  onImportData,
  onResetData,
}) => {
  const [name, setName] = useState(userProfile.name);
  const [role, setRole] = useState(userProfile.role);
  const [manifesto, setManifesto] = useState(userProfile.manifesto);
  const [dailyFocusGoal, setDailyFocusGoal] = useState(userProfile.dailyFocusGoal);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick(900);
    onSaveProfile({
      ...userProfile,
      name,
      role,
      manifesto,
      dailyFocusGoal,
    });
    onClose();
  };

  const handleExportData = () => {
    sound.playTap();
    const payload = {
      userProfile,
      tasks,
      categories,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `atelier-tasks-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && Array.isArray(parsed.tasks)) {
          sound.playChime();
          onImportData(parsed);
          onClose();
        } else {
          alert('Invalid JSON file format for Atelier task manager.');
        }
      } catch {
        alert('Could not parse the selected file.');
      }
    };
    reader.readAsText(file);
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
            marginBottom: '24px',
            paddingBottom: '16px',
            borderBottom: '1px solid var(--border-subtle)'
          }}
        >
          <div>
            <div className="font-mono" style={{ fontSize: '11px', color: 'var(--accent-terracotta)', letterSpacing: '0.08em' }}>
              IDENTITY & ARCHITECTURE
            </div>
            <h2 className="font-display" style={{ fontSize: '22px', fontWeight: 700 }}>
              Personalize Atelier Persona
            </h2>
          </div>

          <button
            onClick={onClose}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'var(--tag-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label className="font-mono" style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-subtle)', display: 'block', marginBottom: '6px' }}>
              Your Name / Monogram
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '12px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                fontSize: '14px',
              }}
            />
          </div>

          <div>
            <label className="font-mono" style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-subtle)', display: 'block', marginBottom: '6px' }}>
              Professional Discipline / Role
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Creative Front-End Developer & Art Director"
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '12px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                fontSize: '14px',
              }}
            />
          </div>

          <div>
            <label className="font-mono" style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-subtle)', display: 'block', marginBottom: '6px' }}>
              Daily Manifesto / Guiding Thought
            </label>
            <textarea
              rows={2}
              value={manifesto}
              onChange={(e) => setManifesto(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '12px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                fontSize: '14px',
              }}
            />
          </div>

          <div>
            <label className="font-mono" style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-subtle)', display: 'block', marginBottom: '6px' }}>
              Daily Target Focus Tasks
            </label>
            <input
              type="number"
              min={1}
              max={20}
              value={dailyFocusGoal}
              onChange={(e) => setDailyFocusGoal(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '10px 16px',
                borderRadius: '12px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                fontSize: '14px',
              }}
            />
          </div>

          {/* Backup & Persistence Actions */}
          <div 
            style={{ 
              padding: '16px', 
              borderRadius: 'var(--border-radius-card)', 
              background: 'var(--tag-bg)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <div className="font-mono" style={{ fontSize: '11px', color: 'var(--text-subtle)', textTransform: 'uppercase' }}>
              DATA PERSISTENCE & PORTABILITY
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleExportData}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  fontSize: '12.5px',
                  fontWeight: 600,
                }}
              >
                <Download size={14} />
                <span>Export Data (.json)</span>
              </button>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Upload size={14} />
                <span>Import JSON</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
              </label>

              <button
                type="button"
                onClick={() => {
                  if (confirm('Reset to original sample data inspired by Guillaume Zhu?')) {
                    sound.playTap();
                    onResetData();
                    onClose();
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  fontSize: '12.5px',
                  color: 'var(--accent-crimson)',
                  fontWeight: 600,
                }}
              >
                <RotateCcw size={14} />
                <span>Reset to Sample</span>
              </button>
            </div>
          </div>

          {/* Submit */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 20px',
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
                padding: '10px 24px',
                borderRadius: '999px',
                background: 'var(--accent-terracotta)',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 700,
              }}
            >
              Save Persona
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
