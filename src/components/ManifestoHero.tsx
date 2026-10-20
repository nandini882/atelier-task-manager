import React from 'react';
import { Plus, Sliders } from 'lucide-react';
import type { ProjectCategory, UserProfile, Task } from '../types/task';
import { sound } from '../utils/audio';

interface ManifestoHeroProps {
  userProfile: UserProfile;
  categories: ProjectCategory[];
  selectedCategory: string | null;
  onSelectCategory: (catId: string | null) => void;
  selectedSubcategory: string | null;
  onSelectSubcategory: (subcat: string | null) => void;
  onOpenCategoryManager: () => void;
  tasks: Task[];
}

export const ManifestoHero: React.FC<ManifestoHeroProps> = ({
  userProfile,
  categories,
  selectedCategory,
  onSelectCategory,
  selectedSubcategory,
  onSelectSubcategory,
  onOpenCategoryManager,
  tasks,
}) => {
  const activeTasks = tasks.filter((t) => t.status !== 'completed');
  const todayStr = new Date().toISOString().split('T')[0];
  const dueTodayCount = tasks.filter((t) => t.dueDate === todayStr && t.status !== 'completed').length;

  const currentCategoryObj = categories.find(
    (c) => c.name.toLowerCase() === selectedCategory?.toLowerCase()
  );

  return (
    <section 
      style={{ 
        padding: 'clamp(20px, 3vw, 40px) 0 clamp(20px, 3vw, 32px)',
        marginBottom: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}
    >
      {/* Subtle Studio Date & Status Eyebrow */}
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          fontSize: '11.5px',
          fontFamily: 'var(--font-mono)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--text-subtle)'
        }}
      >
        <span>
          {userProfile.name} // {userProfile.role}
        </span>
        <span>
          {activeTasks.length === 0 
            ? 'ALL CLEAR' 
            : `${activeTasks.length} ACTIVE ${dueTodayCount > 0 ? `· ${dueTodayCount} DUE TODAY` : ''}`}
        </span>
      </div>

      {/* Grand Minimalist Editorial Statement */}
      <h1 
        className="font-display" 
        style={{ 
          fontSize: 'clamp(28px, 4vw, 52px)', 
          fontWeight: 700, 
          lineHeight: 1.1,
          letterSpacing: 'var(--letter-spacing-display)',
          color: 'var(--text-primary)',
          maxWidth: '850px',
          margin: '4px 0'
        }}
      >
        {userProfile.manifesto}
      </h1>

      {/* Primary Category / Group Pills */}
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          overflowX: 'auto',
          padding: '4px 0',
          scrollbarWidth: 'none'
        }}
      >
        <button
          className={`zh-link ${selectedCategory === null ? 'font-editorial' : ''}`}
          onClick={() => {
            sound.playTap();
            onSelectCategory(null);
            onSelectSubcategory(null);
          }}
          style={{
            padding: '6px 14px',
            borderRadius: '999px',
            fontSize: '13px',
            fontWeight: selectedCategory === null ? 600 : 400,
            background: selectedCategory === null ? 'var(--text-primary)' : 'transparent',
            color: selectedCategory === null ? 'var(--bg-primary)' : 'var(--text-muted)',
            transition: 'all 0.25s ease',
          }}
        >
          All ({tasks.length})
        </button>

        {categories.map((cat) => {
          const isCatActive = selectedCategory?.toLowerCase() === cat.name.toLowerCase();
          const count = tasks.filter((t) => t.category.toLowerCase() === cat.name.toLowerCase()).length;

          return (
            <button
              key={cat.id}
              className={`zh-link ${isCatActive ? 'font-editorial' : ''}`}
              onClick={() => {
                sound.playClick(isCatActive ? 600 : 800);
                onSelectCategory(isCatActive ? null : cat.name);
                onSelectSubcategory(null);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                padding: '6px 14px',
                borderRadius: '999px',
                fontSize: '13px',
                fontWeight: isCatActive ? 600 : 400,
                background: isCatActive ? 'var(--text-primary)' : 'transparent',
                color: isCatActive ? 'var(--bg-primary)' : 'var(--text-muted)',
                transition: 'all 0.25s ease',
              }}
            >
              <span 
                style={{ 
                  width: '6px', 
                  height: '6px', 
                  borderRadius: '50%', 
                  backgroundColor: cat.color,
                  opacity: isCatActive ? 1 : 0.7
                }} 
              />
              <span>{cat.name}</span>
              {count > 0 && <span style={{ opacity: 0.6, fontSize: '11px' }}>({count})</span>}
            </button>
          );
        })}

        {/* Manage / Create Groups Button */}
        <button
          onClick={() => {
            sound.playTap();
            onOpenCategoryManager();
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '6px 12px',
            borderRadius: '999px',
            border: '1px dashed var(--border-color)',
            fontSize: '12px',
            color: 'var(--text-subtle)',
            background: 'transparent',
          }}
          title="Create or manage groups and subcategories"
        >
          <Plus size={12} />
          <span>{categories.length === 0 ? 'Create Group' : 'Manage Groups'}</span>
        </button>
      </div>

      {/* Subcategory Secondary Pills Row (Shown when a category is selected and has subcategories) */}
      {selectedCategory && currentCategoryObj && currentCategoryObj.subcategories.length > 0 && (
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px', 
            overflowX: 'auto',
            paddingLeft: '4px',
            scrollbarWidth: 'none'
          }}
        >
          <span className="font-mono" style={{ fontSize: '10.5px', color: 'var(--text-subtle)', textTransform: 'uppercase', marginRight: '4px' }}>
            Subcat:
          </span>

          <button
            onClick={() => {
              sound.playTap();
              onSelectSubcategory(null);
            }}
            style={{
              padding: '4px 10px',
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: selectedSubcategory === null ? 600 : 400,
              background: selectedSubcategory === null ? 'var(--tag-bg)' : 'transparent',
              color: selectedSubcategory === null ? 'var(--text-primary)' : 'var(--text-subtle)',
            }}
          >
            All Subcats
          </button>

          {currentCategoryObj.subcategories.map((subcat) => {
            const isSubcatActive = selectedSubcategory === subcat;
            const subcatCount = tasks.filter(
              (t) => t.category.toLowerCase() === selectedCategory.toLowerCase() && t.subcategory?.toLowerCase() === subcat.toLowerCase()
            ).length;

            return (
              <button
                key={subcat}
                onClick={() => {
                  sound.playClick(750);
                  onSelectSubcategory(isSubcatActive ? null : subcat);
                }}
                style={{
                  padding: '4px 10px',
                  borderRadius: '999px',
                  fontSize: '12px',
                  fontWeight: isSubcatActive ? 600 : 400,
                  background: isSubcatActive ? 'var(--text-primary)' : 'var(--tag-bg)',
                  color: isSubcatActive ? 'var(--bg-primary)' : 'var(--text-muted)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span>{subcat}</span>
                {subcatCount > 0 && <span style={{ opacity: 0.6, fontSize: '10.5px' }}>({subcatCount})</span>}
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
};
