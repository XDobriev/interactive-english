import type { FC } from 'react';
import { Plus, Trash2, Volume2, ArrowRight } from 'lucide-react';
import type { ExerciseDraft } from '../exerciseDraft';
import { sound } from '../../../utils/audio';
import { type FormProps, speakEnglish, fieldInputStyle, addButtonStyle } from './formShared';

export const MatchPairsForm: FC<FormProps> = ({ draft, onChange }) => {
  const { pairs } = draft;
  const setPairs = (value: ExerciseDraft['pairs']) => onChange({ pairs: value });

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
          Конструктор пар слов и фраз
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
          Ученик будет соединять левый английский элемент с правым русским переводом или определением.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {pairs.map((p, idx) => (
          <div
            key={p.id}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto 1fr auto',
              gap: '12px',
              alignItems: 'center',
              background: '#f8fafc',
              padding: '12px 16px',
              borderRadius: '12px',
              border: '1px solid var(--border-subtle)',
            }}
          >
            {/* Left term with speech button */}
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={p.left}
                onChange={(e) => {
                  setPairs(pairs.map((it, i) => (i === idx ? { ...it, left: e.target.value } : it)));
                }}
                placeholder="English word / phrase"
                style={{
                  ...fieldInputStyle,
                  paddingRight: '36px',
                  fontWeight: 600,
                }}
              />
              <button
                type="button"
                onClick={() => speakEnglish(p.left)}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--primary)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                }}
                title="Произнести"
              >
                <Volume2 size={16} />
              </button>
            </div>

            {/* Connector arrow */}
            <div
              style={{
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ArrowRight size={18} />
            </div>

            {/* Right translation */}
            <div>
              <input
                type="text"
                value={p.right}
                onChange={(e) => {
                  setPairs(pairs.map((it, i) => (i === idx ? { ...it, right: e.target.value } : it)));
                }}
                placeholder="Перевод или определение"
                style={fieldInputStyle}
              />
            </div>

            {/* Delete button */}
            {pairs.length > 1 ? (
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setPairs(pairs.filter((_, i) => i !== idx));
                }}
                style={{
                  border: 'none',
                  background: '#fee2e2',
                  color: 'var(--error)',
                  borderRadius: '8px',
                  padding: '8px',
                  cursor: 'pointer',
                }}
                title="Удалить пару"
              >
                <Trash2 size={15} />
              </button>
            ) : (
              <div style={{ width: '31px' }} />
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={() => {
            sound.playClick();
            setPairs([...pairs, { id: `p-${Date.now()}`, left: '', right: '' }]);
          }}
          style={addButtonStyle}
        >
          <Plus size={16} />
          Добавить пару слов
        </button>
      </div>
    </div>
  );
};
