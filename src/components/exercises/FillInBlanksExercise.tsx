import React, { useMemo, useState } from 'react';
import { CheckCircle2, RotateCcw } from 'lucide-react';
import type { FillBlanksData } from '../../types';
import { sound } from '../../utils/audio';
import { normalizeFillBlanks, type NormalizedBlankItem } from '../../utils/exerciseNormalize';

interface FillInBlanksProps {
  data: FillBlanksData;
  userAnswers?: Record<string, string>;
  onAnswerChange?: (answers: Record<string, string>) => void;
  showAnswers?: boolean;
}

export const FillInBlanksExercise: React.FC<FillInBlanksProps> = ({
  data,
  userAnswers,
  onAnswerChange,
  showAnswers = false,
}) => {
  const items = useMemo(() => normalizeFillBlanks(data), [data]);
  // Remount (resetting answers) when the sentences or the reveal flag change
  return (
    <FillInBlanksBody
      key={`${showAnswers}:${JSON.stringify(items)}`}
      items={items}
      initialAnswers={userAnswers}
      onAnswerChange={onAnswerChange}
      showAnswers={showAnswers}
    />
  );
};

interface FillInBlanksBodyProps {
  items: NormalizedBlankItem[];
  initialAnswers?: Record<string, string>;
  onAnswerChange?: (answers: Record<string, string>) => void;
  showAnswers: boolean;
}

const FillInBlanksBody: React.FC<FillInBlanksBodyProps> = ({
  items,
  initialAnswers,
  onAnswerChange,
  showAnswers,
}) => {
  const [answers, setAnswers] = useState<Record<string, string>>(() =>
    showAnswers ? Object.fromEntries(items.map((item) => [item.id, item.correctAnswer])) : (initialAnswers ?? {})
  );
  const [checked, setChecked] = useState(showAnswers);
  const [scores, setScores] = useState<Record<string, boolean>>(() =>
    showAnswers ? Object.fromEntries(items.map((item) => [item.id, true])) : {}
  );

  const handleInputChange = (id: string, value: string) => {
    const updated = { ...answers, [id]: value };
    setAnswers(updated);
    if (onAnswerChange) {
      onAnswerChange(updated);
    }
    if (checked) {
      setChecked(false);
    }
  };

  const handleCheck = () => {
    let allCorrect = true;
    const newScores: Record<string, boolean> = {};

    items.forEach((item) => {
      const userVal = (answers[item.id] || '').trim().toLowerCase();
      const targetVal = item.correctAnswer.trim().toLowerCase();
      const isOk = userVal === targetVal;
      newScores[item.id] = isOk;
      if (!isOk) allCorrect = false;
    });

    setScores(newScores);
    setChecked(true);

    if (allCorrect) {
      sound.playCorrect();
    } else {
      sound.playIncorrect();
    }
  };

  const handleReset = () => {
    setAnswers({});
    setScores({});
    setChecked(false);
    if (onAnswerChange) onAnswerChange({});
    sound.playClick();
  };

  if (items.length === 0) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
        Задание на заполнение пропусков формируется...
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          background: 'var(--surface-subtle)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '24px 28px',
          fontSize: '16px',
          lineHeight: '2.5',
          color: 'var(--text-main)',
          marginBottom: '20px',
        }}
      >
        {items.map((item, index) => {
          const val = answers[item.id] || '';
          const isEvaluated = checked || showAnswers;
          const isCorrect = scores[item.id];

          let borderStyle = '1.5px solid var(--border-strong)';
          let bgStyle = 'var(--surface-white)';
          let textStyle = 'var(--text-main)';

          if (isEvaluated) {
            if (isCorrect) {
              borderStyle = '1.5px solid var(--success)';
              bgStyle = 'var(--success-subtle)';
              textStyle = 'var(--success-text)';
            } else if (val.length > 0) {
              borderStyle = '1.5px solid var(--error)';
              bgStyle = 'var(--error-subtle)';
              textStyle = 'var(--error-text)';
            }
          }

          return (
            <div key={item.id} style={{ marginBottom: index === items.length - 1 ? 0 : '16px' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-light)', marginRight: '6px' }}>
                {index + 1}.
              </span>
              <span>{item.prefixText}</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', margin: '0 6px', verticalAlign: 'middle' }}>
                <input
                  type="text"
                  value={val}
                  onChange={(e) => handleInputChange(item.id, e.target.value)}
                  placeholder="type word..."
                  style={{
                    fontFamily: 'inherit',
                    fontSize: '15px',
                    fontWeight: 600,
                    height: '38px',
                    padding: '0 14px',
                    borderRadius: '8px',
                    border: borderStyle,
                    background: bgStyle,
                    color: textStyle,
                    outline: 'none',
                    textAlign: 'center',
                    minWidth: '130px',
                    transition: 'all 0.15s ease',
                    boxShadow: 'var(--shadow-subtle)',
                  }}
                />
                {item.hint && (
                  <span style={{ color: 'var(--text-light)', fontSize: '13.5px', fontStyle: 'italic', marginLeft: '6px' }}>
                    ({item.hint})
                  </span>
                )}
              </span>
              <span>{item.suffixText}</span>
            </div>
          );
        })}
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '16px',
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        <div>
          {checked && (
            <span
              style={{
                fontSize: '13.5px',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: Object.values(scores).every(Boolean) ? 'var(--success)' : 'var(--teacher-accent)',
              }}
            >
              <CheckCircle2 size={16} />
              Верно: {Object.values(scores).filter(Boolean).length} из {items.length}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={handleReset}>
            <RotateCcw size={15} />
            Сбросить
          </button>
          <button className="btn btn-primary" onClick={handleCheck}>
            Проверить ответы
          </button>
        </div>
      </div>
    </div>
  );
};
