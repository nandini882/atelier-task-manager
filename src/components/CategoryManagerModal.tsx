import React, { useState } from 'react';
import { X, Plus, Trash2, FolderPlus, Tag } from 'lucide-react';
import type { ProjectCategory } from '../types/task';
import { categoryColorPresets } from '../utils/initialData';
import { sound } from '../utils/audio';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: ProjectCategory[];
  onAddCategory: (category: ProjectCategory) => void;
  onDeleteCategory: (categoryId: string) => void;
  onAddSubcategory: (categoryId: string, subcategoryName: string) => void;
  onDeleteSubcategory: (categoryId: string, subcategoryName: string) => void;
}

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  isOpen,
  onClose,
  categories,
  onAddCategory,
  onDeleteCategory,
  onAddSubcategory,
  onDeleteSubcategory,
}) => {
  const [newCatName, setNewCatName] = useState('');
  const [selectedColor, setSelectedColor] = useState(categoryColorPresets[0]);
  const [newSubcatInputs, setNewSubcatInputs] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    sound.playTap();
    const newCategory: ProjectCategory = {
      id: `cat-${Date.now()}`,
      name: newCatName.trim(),
      color: selectedColor,
      subcategories: [],
    };
    onAddCategory(newCategory);
    setNewCatName('');
  };

  const handleAddSubcat = (categoryId: string) => {
    const val = (newSubcatInputs[categoryId] || '').trim();
    if (!val) return;

    sound.playTap();
    onAddSubcategory(categoryId, val);
    setNewSubcatInputs((prev) => ({ ...prev, [categoryId]: '' }));
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
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
              CUSTOM ARCHITECTURE
            </div>
            <h2 className="font-display" style={{ fontSize: '20px', fontWeight: 700 }}>
              Manage Groups & Subcategories
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

        {/* Add New Group Section */}
        <form 
          onSubmit={handleCreateCategory}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            padding: '16px',
            borderRadius: '16px',
            background: 'var(--bg-input)',
            border: '1px solid var(--border-color)',
            marginBottom: '24px'
          }}
        >
          <div className="font-mono" style={{ fontSize: '11px', color: 'var(--text-subtle)', textTransform: 'uppercase' }}>
            Create New Group
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="e.g. Work, Studio, Fitness, Learning..."
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '10px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                fontSize: '13.5px',
                color: 'var(--text-primary)',
              }}
            />

            <button
              type="submit"
              disabled={!newCatName.trim()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 18px',
                borderRadius: '10px',
                background: newCatName.trim() ? 'var(--text-primary)' : 'var(--tag-bg)',
                color: newCatName.trim() ? 'var(--bg-primary)' : 'var(--text-subtle)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: newCatName.trim() ? 'pointer' : 'default',
              }}
            >
              <Plus size={14} />
              <span>Create</span>
            </button>
          </div>

          {/* Color Palettes */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="font-mono" style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>Color:</span>
            {categoryColorPresets.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: color,
                  border: selectedColor === color ? '2px solid var(--text-primary)' : '2px solid transparent',
                  transform: selectedColor === color ? 'scale(1.15)' : 'scale(1)',
                  transition: 'transform 0.15s ease',
                  cursor: 'pointer'
                }}
              />
            ))}
          </div>
        </form>

        {/* Existing Groups & Subcategories List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '55vh', overflowY: 'auto' }}>
          {categories.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)' }}>
              <FolderPlus size={28} style={{ opacity: 0.4, marginBottom: '8px' }} />
              <p style={{ fontSize: '13.5px' }}>No groups created yet. Type a name above to create your first group.</p>
            </div>
          ) : (
            categories.map((cat) => (
              <div
                key={cat.id}
                style={{
                  padding: '16px',
                  borderRadius: '14px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                {/* Group Top Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: cat.color }} />
                    <span style={{ fontSize: '15px', fontWeight: 600 }}>{cat.name}</span>
                    <span className="font-mono" style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>
                      ({cat.subcategories.length} subcats)
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      sound.playTap();
                      onDeleteCategory(cat.id);
                    }}
                    style={{ color: 'var(--text-subtle)', padding: '4px' }}
                    title="Delete group"
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-crimson)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-subtle)')}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                {/* Subcategories list */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                  {cat.subcategories.map((subcat) => (
                    <span
                      key={subcat}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 10px',
                        borderRadius: '999px',
                        background: 'var(--tag-bg)',
                        fontSize: '12px',
                        color: 'var(--text-primary)',
                      }}
                    >
                      <Tag size={10} style={{ opacity: 0.6 }} />
                      <span>{subcat}</span>
                      <button
                        type="button"
                        onClick={() => {
                          sound.playTap();
                          onDeleteSubcategory(cat.id, subcat);
                        }}
                        style={{ color: 'var(--text-subtle)', display: 'flex' }}
                        title="Remove subcategory"
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>

                {/* Add Subcategory input */}
                <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                  <input
                    type="text"
                    value={newSubcatInputs[cat.id] || ''}
                    onChange={(e) => setNewSubcatInputs({ ...newSubcatInputs, [cat.id]: e.target.value })}
                    placeholder={`+ Add subcat to ${cat.name}...`}
                    style={{
                      flex: 1,
                      padding: '6px 12px',
                      borderRadius: '8px',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '12.5px',
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSubcat(cat.id);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleAddSubcat(cat.id)}
                    style={{
                      padding: '6px 12px',
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
            ))
          )}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 20px',
              borderRadius: '999px',
              background: 'var(--text-primary)',
              color: 'var(--bg-primary)',
              fontSize: '13px',
              fontWeight: 600,
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
