import React from 'react';
import { Play, GraduationCap, Edit3, Link2, Check, Copy, Trash2 } from 'lucide-react';
import type { Lesson } from '../../types';
import { sound } from '../../utils/audio';

interface LessonCardProps {
  lesson: Lesson;
  onStartLesson: (lesson: Lesson, role: 'teacher' | 'student') => void;
  onEditLesson: (lesson: Lesson) => void;
  onDuplicateLesson: (lesson: Lesson) => void;
  onDeleteLesson: (lessonId: string) => void;
  isCopied: boolean;
  onCopyLink: (lessonId: string) => void;
}

export const LessonCard: React.FC<LessonCardProps> = ({
  lesson,
  onStartLesson,
  onEditLesson,
  onDuplicateLesson,
  onDeleteLesson,
  isCopied,
  onCopyLink,
}) => {
  const exerciseCount = lesson.sections.reduce((acc, s) => acc + s.exercises.length, 0);

  return (
    <div
      className="app-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRadius: 'var(--radius-lg)',
      }}
    >
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
          <span className="level-badge">{lesson.level}</span>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-light)' }}>
            Юнит {lesson.unitNumber}
          </span>
        </div>

        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '18px',
            fontWeight: 800,
            color: 'var(--text-main)',
            marginBottom: '8px',
            lineHeight: 1.35,
          }}
        >
          {lesson.title}
        </h3>

        <p
          style={{
            fontSize: '13.5px',
            color: 'var(--text-muted)',
            marginBottom: '18px',
            lineHeight: 1.5,
            minHeight: '40px',
          }}
        >
          {lesson.description}
        </p>

        <div
          style={{
            display: 'flex',
            gap: '14px',
            fontSize: '12.5px',
            color: 'var(--text-muted)',
            padding: '10px 14px',
            background: 'var(--surface-subtle)',
            borderRadius: '8px',
            marginBottom: '20px',
          }}
        >
          <span>📑 {lesson.sections.length} секций</span>
          <span>🧩 {exerciseCount} упражнений</span>
          <span>📖 {lesson.vocabulary.length} слов</span>
        </div>
      </div>

      {/* Actions */}
      <div
        style={{
          paddingTop: '16px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <button
            className="btn btn-primary"
            onClick={() => {
              sound.playClick();
              onStartLesson(lesson, 'teacher');
            }}
            title="Начать занятие с подсказками учителя"
          >
            <Play size={15} />
            Вести урок
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => {
              sound.playClick();
              onStartLesson(lesson, 'student');
            }}
            title="Открыть экран выполнения для ученика"
          >
            <GraduationCap size={15} />
            Вид ученика
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => {
                sound.playClick();
                onEditLesson(lesson);
              }}
              className="btn btn-secondary"
              style={{ padding: '5px 10px', fontSize: '12px' }}
              title="Редактировать материалы урока"
            >
              <Edit3 size={13} />
              Изменить
            </button>

            <button
              onClick={() => onCopyLink(lesson.id)}
              className="btn btn-secondary"
              style={{ padding: '5px 10px', fontSize: '12px', color: isCopied ? 'var(--success)' : undefined }}
              title="Скопировать прямую ссылку для ученика"
            >
              {isCopied ? <Check size={13} /> : <Link2 size={13} />}
              {isCopied ? 'Скопировано!' : 'Ссылка'}
            </button>
          </div>

          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              onClick={() => {
                sound.playClick();
                onDuplicateLesson(lesson);
              }}
              className="btn btn-secondary"
              style={{ padding: '5px 8px', color: 'var(--text-muted)' }}
              title="Дублировать урок"
            >
              <Copy size={13} />
            </button>
            <button
              onClick={() => {
                if (confirm(`Удалить урок "${lesson.title}"?`)) {
                  sound.playClick();
                  onDeleteLesson(lesson.id);
                }
              }}
              className="btn btn-secondary"
              style={{ padding: '5px 8px', color: 'var(--error)' }}
              title="Удалить урок"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
