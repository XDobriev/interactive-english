import React from 'react';
import { Lock } from 'lucide-react';

interface TeacherNoteProps {
  note?: string;
  isTeacher: boolean;
}

export const TeacherNote: React.FC<TeacherNoteProps> = ({ note, isTeacher }) => {
  if (!isTeacher || !note) return null;

  return (
    <div
      style={{
        background: 'var(--teacher-bg)',
        border: '1.5px solid var(--teacher-border)',
        borderLeft: '5px solid var(--teacher-accent)',
        borderRadius: 'var(--radius-md)',
        padding: '16px 20px',
        marginTop: '20px',
        boxShadow: '0 2px 8px rgba(245, 158, 11, 0.08)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '8px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: 'var(--font-display)',
            fontSize: '12px',
            fontWeight: 800,
            color: 'var(--teacher-text)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          <Lock size={15} color="var(--teacher-accent)" strokeWidth={2.5} />
          Подсказка для преподавателя
        </div>
        <span
          style={{
            background: '#fde68a',
            color: '#78350f',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 700,
          }}
        >
          Видно только вам
        </span>
      </div>
      <div
        style={{
          fontSize: '13.5px',
          color: '#78350f',
          lineHeight: '1.6',
        }}
      >
        {note}
      </div>
    </div>
  );
};
