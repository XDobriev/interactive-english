import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import type { QuizData } from '../../types';
import { sound } from '../../utils/audio';

interface QuizProps {
  data: QuizData;
  showAnswers?: boolean;
}

export const QuizExercise: React.FC<QuizProps> = ({ data, showAnswers = false }) => {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({});

  const rawQuestions = Array.isArray(data?.questions)
    ? data.questions
    : (data as any)?.question
    ? [data]
    : Array.isArray(data)
    ? data
    : [];
  const questions = rawQuestions.map((q: any, i: number) => ({
    id: q.id || `q-${i}`,
    question: q.question || '',
    options: Array.isArray(q.options) ? q.options : ['Option A', 'Option B'],
    correctOptionIndex: typeof q.correctOptionIndex === 'number' ? q.correctOptionIndex : 0,
    explanation: q.explanation || undefined,
  }));

  useEffect(() => {
    if (showAnswers) {
      const revealed: Record<string, number> = {};
      const status: Record<string, boolean> = {};
      questions.forEach((q) => {
        revealed[q.id] = q.correctOptionIndex;
        status[q.id] = true;
      });
      setSelectedOptions(revealed);
      setSubmitted(status);
    }
  }, [showAnswers, questions.length]);

  const handleSelect = (questionId: string, optionIndex: number, correctIndex: number) => {
    sound.playClick();
    setSelectedOptions({ ...selectedOptions, [questionId]: optionIndex });
    setSubmitted({ ...submitted, [questionId]: true });

    if (optionIndex === correctIndex) {
      sound.playCorrect();
    } else {
      sound.playIncorrect();
    }
  };

  const handleReset = () => {
    sound.playClick();
    setSelectedOptions({});
    setSubmitted({});
  };

  if (questions.length === 0) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
        Вопрос теста формируется...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {questions.map((q, idx) => {
        const isSelected = selectedOptions[q.id] !== undefined;
        const selectedIndex = selectedOptions[q.id];
        const isCorrect = selectedIndex === q.correctOptionIndex;

        return (
          <div
            key={q.id}
            style={{
              background: 'var(--surface-subtle)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '24px',
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-light)', marginBottom: '8px' }}>
              Вопрос {idx + 1}
            </div>

            <div style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '16px' }}>
              {q.question}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {q.options.map((option: string, optIdx: number) => {
                const isThisSelected = selectedIndex === optIdx;
                const isThisTargetCorrect = optIdx === q.correctOptionIndex;

                let border = '1.5px solid var(--border-subtle)';
                let bg = 'var(--surface-white)';
                let text = 'var(--text-main)';

                if (isSelected) {
                  if (isThisTargetCorrect) {
                    border = '1.5px solid var(--success-border)';
                    bg = 'var(--success-subtle)';
                    text = 'var(--success-text)';
                  } else if (isThisSelected) {
                    border = '1.5px solid var(--error-border)';
                    bg = 'var(--error-subtle)';
                    text = 'var(--error-text)';
                  }
                }

                return (
                  <div
                    key={optIdx}
                    onClick={() => handleSelect(q.id, optIdx, q.correctOptionIndex)}
                    style={{
                      padding: '12px 18px',
                      borderRadius: '10px',
                      border,
                      background: bg,
                      color: text,
                      fontSize: '14.5px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s ease',
                      boxShadow: 'var(--shadow-subtle)',
                    }}
                  >
                    <span>{option}</span>
                    {isSelected && isThisTargetCorrect && <CheckCircle2 size={17} color="var(--success)" />}
                    {isSelected && isThisSelected && !isThisTargetCorrect && <XCircle size={17} color="var(--error)" />}
                  </div>
                );
              })}
            </div>

            {isSelected && q.explanation && (
              <div
                style={{
                  marginTop: '14px',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  background: isCorrect ? 'var(--success-subtle)' : '#fef2f2',
                  border: isCorrect ? '1px solid var(--success-border)' : '1px solid #fecaca',
                  fontSize: '13px',
                  color: isCorrect ? 'var(--success-text)' : '#991b1b',
                  lineHeight: 1.5,
                }}
              >
                <strong>{isCorrect ? 'Пояснение:' : 'Разбор правила:'}</strong> {q.explanation}
              </div>
            )}
          </div>
        );
      })}

      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '10px' }}>
        <button className="btn btn-secondary" onClick={handleReset}>
          <RotateCcw size={15} />
          Сбросить тест
        </button>
      </div>
    </div>
  );
};
