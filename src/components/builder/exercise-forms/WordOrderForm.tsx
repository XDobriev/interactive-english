import type { FC } from 'react';
import { Volume2 } from 'lucide-react';
import { type FormProps, speakEnglish, subLabelStyle, fieldInputStyle } from './formShared';

export const WordOrderForm: FC<FormProps> = ({ draft, onChange }) => {
  const { targetSentence, distractors, hint } = draft;
  const setTargetSentence = (value: string) => onChange({ targetSentence: value });
  const setDistractors = (value: string) => onChange({ distractors: value });
  const setHint = (value: string) => onChange({ hint: value });

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
          Конструктор порядка слов (Unscramble)
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
          Введите правильное английское предложение. Система автоматически разобьет его на интерактивные плашки.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={subLabelStyle}>Целевое предложение (Правильный порядок слов)</label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={targetSentence}
              onChange={(e) => setTargetSentence(e.target.value)}
              placeholder="Could you please tell me where the departure gate is?"
              style={{
                ...fieldInputStyle,
                fontSize: '15px',
                fontWeight: 600,
                paddingRight: '40px',
              }}
            />
            <button
              type="button"
              onClick={() => speakEnglish(targetSentence)}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                border: 'none',
                background: 'transparent',
                color: 'var(--primary)',
                cursor: 'pointer',
              }}
              title="Озвучить все предложение"
            >
              <Volume2 size={18} />
            </button>
          </div>
        </div>

        {/* Word chips preview */}
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '16px',
          }}
        >
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-light)', display: 'block', marginBottom: '8px' }}>
            Автоматически сформированные плашки:
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {targetSentence
              .trim()
              .split(/\s+/)
              .map((word, i) => (
                <span
                  key={i}
                  style={{
                    background: '#ffffff',
                    border: '1.5px solid var(--border-strong)',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: 'var(--text-main)',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  }}
                >
                  {word}
                </span>
              ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={subLabelStyle}>Лишние слова / дистракторы (через запятую)</label>
            <input
              type="text"
              value={distractors}
              onChange={(e) => setDistractors(e.target.value)}
              placeholder="did, was, been (опционально)"
              style={fieldInputStyle}
            />
          </div>

          <div>
            <label style={subLabelStyle}>Подсказка ученику</label>
            <input
              type="text"
              value={hint}
              onChange={(e) => setHint(e.target.value)}
              placeholder="Start with 'Could you'..."
              style={fieldInputStyle}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
