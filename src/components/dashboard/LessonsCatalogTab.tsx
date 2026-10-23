import React, { useState } from 'react';
import { Search } from 'lucide-react';
import type { Lesson, CEFRLevel } from '../../types';
import { LessonCard } from './LessonCard';
import { sound } from '../../utils/audio';

interface LessonsCatalogTabProps {
  lessons: Lesson[];
  onStartLesson: (lesson: Lesson, role: 'teacher' | 'student') => void;
  onEditLesson: (lesson: Lesson) => void;
  onDuplicateLesson: (lesson: Lesson) => void;
  onDeleteLesson: (lessonId: string) => void;
}

export const LessonsCatalogTab: React.FC<LessonsCatalogTabProps> = ({
  lessons,
  onStartLesson,
  onEditLesson,
  onDuplicateLesson,
  onDeleteLesson,
}) => {
  const [selectedLevel, setSelectedLevel] = useState<CEFRLevel | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredLessons = lessons
    .filter((l) => (selectedLevel === 'ALL' ? true : l.level === selectedLevel))
    .filter((l) =>
      searchQuery
        ? l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          l.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
          l.description.toLowerCase().includes(searchQuery.toLowerCase())
        : true
    );

  const handleCopyLink = (lessonId: string) => {
    sound.playClick();
    const url = `${window.location.origin}${window.location.pathname}?lesson=${lessonId}&role=student`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).catch(() => {});
    }
    setCopiedId(lessonId);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div>
      {/* Filters and Search Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
          marginBottom: '24px',
        }}
      >
        {/* CEFR Level Filter Pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {(['ALL', 'A1', 'A2', 'B1', 'B2', 'C1'] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => {
                sound.playClick();
                setSelectedLevel(lvl);
              }}
              style={{
                border: 'none',
                background: selectedLevel === lvl ? 'var(--primary)' : 'var(--surface-white)',
                color: selectedLevel === lvl ? '#ffffff' : 'var(--text-muted)',
                padding: '7px 16px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: selectedLevel === lvl ? '0 2px 6px rgba(79, 70, 229, 0.25)' : 'var(--shadow-subtle)',
                borderWidth: selectedLevel === lvl ? '0' : '1px',
                borderStyle: 'solid',
                borderColor: 'var(--border-subtle)',
                transition: 'all 0.15s ease',
              }}
            >
              {lvl === 'ALL' ? 'Все уровни' : lvl}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={15} color="var(--text-light)" style={{ position: 'absolute', left: '12px', top: '10px' }} />
          <input
            type="text"
            placeholder="Поиск по урокам..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 34px',
              borderRadius: '20px',
              border: '1.5px solid var(--border-subtle)',
              fontSize: '13px',
              outline: 'none',
              background: 'var(--surface-white)',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      {/* Lesson Cards Grid */}
      {filteredLessons.length > 0 ? (
        <div className="dashboard-lessons-grid">
          {filteredLessons.map((lesson) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              onStartLesson={onStartLesson}
              onEditLesson={onEditLesson}
              onDuplicateLesson={onDuplicateLesson}
              onDeleteLesson={onDeleteLesson}
              isCopied={copiedId === lesson.id}
              onCopyLink={handleCopyLink}
            />
          ))}
        </div>
      ) : (
        <div
          className="app-card"
          style={{
            textAlign: 'center',
            padding: '48px 24px',
            color: 'var(--text-muted)',
          }}
        >
          <p style={{ fontSize: '16px', fontWeight: 600, marginBottom: '6px' }}>Уроки не найдены</p>
          <p style={{ fontSize: '13.5px' }}>Попробуйте изменить поисковый запрос или фильтр по уровню.</p>
        </div>
      )}
    </div>
  );
};
