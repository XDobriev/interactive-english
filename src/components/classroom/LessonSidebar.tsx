import React from 'react';
import type { LessonSection } from '../../types';

interface LessonSidebarProps {
  sections: LessonSection[];
  activeSectionId: string;
  onSelectSection: (sectionId: string) => void;
  completedSectionIds: string[];
}

export const LessonSidebar: React.FC<LessonSidebarProps> = ({
  sections,
  activeSectionId,
  onSelectSection,
  completedSectionIds,
}) => {
  const completedCount = completedSectionIds.length;
  const progressPercent = Math.round((completedCount / (sections.length || 1)) * 100);

  return (
    <aside className="card-panel" style={{ height: 'fit-content', position: 'sticky', top: '102px' }}>
      <div className="panel-heading">
        <span>План занятия</span>
        <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 700 }}>
          {completedCount} / {sections.length} готово
        </span>
      </div>

      <div className="plan-list">
        {sections.map((section, idx) => {
          const isActive = section.id === activeSectionId;
          const isDone = completedSectionIds.includes(section.id);

          return (
            <div
              key={section.id}
              onClick={() => onSelectSection(section.id)}
              className={`plan-item ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}
            >
              <div className="plan-index">{isDone ? '✓' : idx + 1}</div>
              <div>
                <div className="plan-title">{section.title}</div>
                <div className="plan-sub">{section.subtitle}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px solid var(--border-subtle)' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '12px',
            fontWeight: 700,
            color: 'var(--text-muted)',
            marginBottom: '6px',
          }}
        >
          <span>Прогресс студента</span>
          <span style={{ color: 'var(--primary)' }}>{progressPercent}%</span>
        </div>
        <div style={{ height: '7px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
          <div
            style={{
              width: `${progressPercent}%`,
              height: '100%',
              background: 'var(--primary)',
              borderRadius: '4px',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>
    </aside>
  );
};
