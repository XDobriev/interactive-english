import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import type { ExerciseType } from '../../types';
import { EXERCISE_TYPES } from './exerciseTypes';
interface StudioFooterProps {
  selectedType: ExerciseType;
  scoreWeight: number;
  isEditing: boolean;
  onCancel: () => void;
  onSave: () => void;
}

export const StudioFooter: React.FC<StudioFooterProps> = ({
  selectedType,
  scoreWeight,
  isEditing,
  onCancel: onClose,
  onSave: handleSave,
}) => {
  return (
    <footer
      style={{
        height: '68px',
        padding: '0 28px',
        background: '#ffffff',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span
          style={{
            fontSize: '12.5px',
            fontWeight: 600,
            color: 'var(--text-muted)',
          }}
        >
          Тип: <strong style={{ color: 'var(--text-main)' }}>{EXERCISE_TYPES.find((t) => t.type === selectedType)?.title}</strong>
        </span>
        <span style={{ color: 'var(--border-strong)' }}>•</span>
        <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
          Вес: <strong style={{ color: 'var(--primary)' }}>{scoreWeight} б.</strong>
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onClose}
          style={{ padding: '9px 18px' }}
        >
          Отмена
        </button>

        <button
          type="button"
          onClick={handleSave}
          style={{
            background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '10px',
            padding: '10px 24px',
            fontSize: '14px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)',
            transition: 'all 0.15s ease',
          }}
        >
          <CheckCircle2 size={16} />
          {isEditing ? 'Сохранить изменения' : 'Сохранить и добавить в урок'}
        </button>
      </div>
    </footer>
  );
};
