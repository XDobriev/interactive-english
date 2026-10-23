import type { FC } from 'react';
import { Check, Plus, Trash2 } from 'lucide-react';
import { sound } from '../../../utils/audio';
import { type FormProps, subLabelStyle, fieldInputStyle, addButtonStyle } from './formShared';

export const QuizForm: FC<FormProps> = ({ draft, onChange }) => {
  const { quizQuestion, quizOptions, correctOptionIdx, quizExplanation } = draft;
  const setQuizQuestion = (value: string) => onChange({ quizQuestion: value });
  const setQuizOptions = (value: string[]) => onChange({ quizOptions: value });
  const setCorrectOptionIdx = (value: number) => onChange({ correctOptionIdx: value });
  const setQuizExplanation = (value: string) => onChange({ quizExplanation: value });

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
          Конструктор теста с выбором ответа (Multiple Choice)
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
          Введите вопрос и варианты ответов. Отметьте радио-кнопкой правильный вариант.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div>
          <label style={subLabelStyle}>Текст вопроса / незавершенная фраза</label>
          <input
            type="text"
            value={quizQuestion}
            onChange={(e) => setQuizQuestion(e.target.value)}
            placeholder="She wouldn't have missed the flight if she _____ earlier."
            style={{ ...fieldInputStyle, fontSize: '15px', fontWeight: 600 }}
          />
        </div>

        <div>
          <label style={subLabelStyle}>Варианты ответов (отметьте верный):</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {quizOptions.map((opt, idx) => {
              const isCorrect = correctOptionIdx === idx;
              const letter = String.fromCharCode(65 + idx);
              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    background: isCorrect ? 'var(--success-subtle)' : '#f8fafc',
                    border: isCorrect ? '2px solid var(--success)' : '1px solid var(--border-subtle)',
                    borderRadius: '12px',
                    padding: '10px 14px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setCorrectOptionIdx(idx);
                    }}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      border: isCorrect ? 'none' : '2px solid var(--border-strong)',
                      background: isCorrect ? 'var(--success)' : '#ffffff',
                      color: isCorrect ? '#ffffff' : 'var(--text-main)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '13px',
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                  >
                    {isCorrect ? <Check size={16} strokeWidth={3} /> : letter}
                  </button>

                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => {
                      const updated = [...quizOptions];
                      updated[idx] = e.target.value;
                      setQuizOptions(updated);
                    }}
                    placeholder={`Вариант ${letter}...`}
                    style={{
                      ...fieldInputStyle,
                      background: '#ffffff',
                      fontWeight: isCorrect ? 700 : 500,
                    }}
                  />

                  {isCorrect && (
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 800,
                        color: 'var(--success-text)',
                        background: 'var(--success-border)',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Правильный ответ
                    </span>
                  )}

                  {quizOptions.length > 2 && (
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        const updated = quizOptions.filter((_, i) => i !== idx);
                        setQuizOptions(updated);
                        if (correctOptionIdx >= updated.length) {
                          setCorrectOptionIdx(0);
                        }
                      }}
                      style={{
                        border: 'none',
                        background: 'transparent',
                        color: 'var(--text-light)',
                        cursor: 'pointer',
                        padding: '4px',
                      }}
                      title="Удалить вариант"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {quizOptions.length < 6 && (
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setQuizOptions([...quizOptions, `Option ${quizOptions.length + 1}`]);
              }}
              style={{ ...addButtonStyle, marginTop: '10px' }}
            >
              <Plus size={16} />
              Добавить вариант ответа
            </button>
          )}
        </div>

        <div>
          <label style={subLabelStyle}>Грамматическое пояснение (показывается при разборе ошибки)</label>
          <textarea
            rows={2}
            value={quizExplanation}
            onChange={(e) => setQuizExplanation(e.target.value)}
            placeholder="Third Conditional: If + Past Perfect, would have + V3..."
            style={{
              ...fieldInputStyle,
              resize: 'none',
            }}
          />
        </div>
      </div>
    </div>
  );
};
