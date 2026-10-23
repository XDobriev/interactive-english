import React from 'react';
import { Check, Lock } from 'lucide-react';
import type { ExerciseType } from '../../types';
import { sound } from '../../utils/audio';
import { EXERCISE_TYPES } from './exerciseTypes';
interface SettingsSidebarProps {
  selectedType: ExerciseType;
  onTypeChange: (type: ExerciseType) => void;
  instruction: string;
  onInstructionChange: (value: string) => void;
  scoreWeight: number;
  onScoreWeightChange: (value: number) => void;
  teacherNote: string;
  onTeacherNoteChange: (value: string) => void;
}

export const SettingsSidebar: React.FC<SettingsSidebarProps> = ({
  selectedType,
  onTypeChange: setSelectedType,
  instruction,
  onInstructionChange: setInstruction,
  scoreWeight,
  onScoreWeightChange: setScoreWeight,
  teacherNote,
  onTeacherNoteChange: setTeacherNote,
}) => {
  return (
    <div
      style={{
        width: '320px',
        background: '#f8fafc',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        padding: '20px',
        gap: '20px',
        flexShrink: 0,
      }}
    >
      {/* Exercise Mechanics Selector */}
      <div>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 800,
            color: 'var(--text-light)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            display: 'block',
            marginBottom: '10px',
          }}
        >
          Тип интерактивного задания
        </span>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {EXERCISE_TYPES.map((t) => {
            const isSelected = selectedType === t.type;
            return (
              <div
                key={t.type}
                onClick={() => {
                  sound.playClick();
                  setSelectedType(t.type);
                  if (t.type === 'fill_blanks') setInstruction('Fill in the blanks with the correct form of the verb:');
                  else if (t.type === 'match_pairs') setInstruction('Match the words on the left with their translations:');
                  else if (t.type === 'word_order') setInstruction('Unscramble the words to assemble a natural sentence:');
                  else if (t.type === 'flashcards') setInstruction('Review and memorize the vocabulary cards:');
                  else if (t.type === 'quiz') setInstruction('Select the single correct answer:');
                  else if (t.type === 'media_rule') setInstruction('Study the rule and answer the speaking questions:');
                }}
                style={{
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: isSelected ? `2px solid ${t.color}` : '1.5px solid var(--border-subtle)',
                  background: isSelected ? t.bgSubtle : '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'all 0.15s ease',
                  boxShadow: isSelected ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                }}
              >
                <span style={{ fontSize: '22px' }}>{t.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-main)' }}>
                    {t.title}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {t.tag}
                  </div>
                </div>
                {isSelected && <Check size={16} color={t.color} strokeWidth={3} />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Student Instruction Input */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid var(--border-subtle)',
          borderRadius: '14px',
          padding: '16px',
        }}
      >
        <label
          style={{
            display: 'block',
            fontSize: '11px',
            fontWeight: 800,
            color: 'var(--text-light)',
            textTransform: 'uppercase',
            marginBottom: '8px',
            letterSpacing: '0.04em',
          }}
        >
          Инструкция для студента
        </label>
        <textarea
          rows={2}
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          style={{
            width: '100%',
            fontFamily: 'inherit',
            fontSize: '13px',
            padding: '8px 10px',
            borderRadius: '8px',
            border: '1.5px solid var(--border-subtle)',
            outline: 'none',
            resize: 'none',
            boxSizing: 'border-box',
          }}
        />

        {/* Score weight pills */}
        <div style={{ marginTop: '14px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: 800,
              color: 'var(--text-light)',
              textTransform: 'uppercase',
              marginBottom: '8px',
            }}
          >
            Баллов за упражнение
          </label>
          <div style={{ display: 'flex', gap: '6px' }}>
            {[1, 2, 3, 4, 5, 10].map((pts) => (
              <button
                key={pts}
                type="button"
                onClick={() => {
                  sound.playClick();
                  setScoreWeight(pts);
                }}
                style={{
                  flex: 1,
                  padding: '6px 0',
                  borderRadius: '8px',
                  border: scoreWeight === pts ? '1.5px solid var(--primary)' : '1px solid var(--border-subtle)',
                  background: scoreWeight === pts ? 'var(--primary)' : '#f8fafc',
                  color: scoreWeight === pts ? '#ffffff' : 'var(--text-main)',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {pts}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Private Teacher Note */}
      <div
        style={{
          background: 'var(--teacher-bg)',
          border: '1.5px dashed var(--teacher-border)',
          borderRadius: '14px',
          padding: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
          <Lock size={14} color="var(--teacher-text)" />
          <span style={{ fontSize: '11.5px', fontWeight: 800, color: 'var(--teacher-text)', textTransform: 'uppercase' }}>
            Заметка для учителя
          </span>
        </div>
        <textarea
          rows={3}
          value={teacherNote}
          onChange={(e) => setTeacherNote(e.target.value)}
          placeholder="Методическая подсказка, видная только вам во время урока..."
          style={{
            width: '100%',
            fontFamily: 'inherit',
            fontSize: '12.5px',
            padding: '8px 10px',
            borderRadius: '8px',
            border: '1px solid var(--teacher-border)',
            background: '#ffffff',
            color: 'var(--text-main)',
            outline: 'none',
            resize: 'none',
            boxSizing: 'border-box',
          }}
        />
      </div>
    </div>
  );
};
