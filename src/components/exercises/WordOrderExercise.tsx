import React, { useState, useEffect } from 'react';
import { CheckCircle2, RotateCcw } from 'lucide-react';
import type { WordOrderData } from '../../types';
import { sound } from '../../utils/audio';

interface WordOrderProps {
  data: WordOrderData;
  showAnswers?: boolean;
}

export const WordOrderExercise: React.FC<WordOrderProps> = ({
  data,
  showAnswers = false,
}) => {
  // Normalize items defensively
  const rawItems = Array.isArray(data?.items)
    ? data.items
    : (data as any)?.targetSentence
    ? [data]
    : Array.isArray(data)
    ? data
    : [];

  const items = rawItems.map((it: any, idx: number) => {
    const targetSentence = it.targetSentence ?? it.sentence ?? '';
    const words = targetSentence.trim().split(/\s+/).filter(Boolean);
    const shuffledWords = Array.isArray(it.shuffledWords) && it.shuffledWords.length > 0
      ? it.shuffledWords
      : [...words].sort(() => Math.random() - 0.5);
    return {
      id: it.id || `wo-${idx}`,
      targetSentence,
      shuffledWords,
      hint: it.hint || undefined,
      distractors: it.distractors || undefined,
    };
  });

  // State for each sentence item: placed word indices
  const [placedWords, setPlacedWords] = useState<Record<string, string[]>>({});
  const [checkedStatus, setCheckedStatus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Initialize empty placed words
    const initPlaced: Record<string, string[]> = {};
    items.forEach((item) => {
      initPlaced[item.id] = [];
    });
    setPlacedWords(initPlaced);
    setCheckedStatus({});
  }, [items.length]);

  useEffect(() => {
    if (showAnswers) {
      const revealed: Record<string, string[]> = {};
      const status: Record<string, boolean> = {};
      items.forEach((item) => {
        // Split target sentence into words
        const targetWords = item.targetSentence.split(/\s+/);
        revealed[item.id] = targetWords;
        status[item.id] = true;
      });
      setPlacedWords(revealed);
      setCheckedStatus(status);
    }
  }, [showAnswers, items.length]);

  const handleWordClick = (itemId: string, word: string, fromPlaced: boolean) => {
    sound.playClick();
    const currentPlaced = placedWords[itemId] || [];
    let updatedPlaced: string[];

    if (fromPlaced) {
      // Remove first occurrence of word from placed
      const idx = currentPlaced.lastIndexOf(word);
      if (idx !== -1) {
        updatedPlaced = [...currentPlaced.slice(0, idx), ...currentPlaced.slice(idx + 1)];
      } else {
        updatedPlaced = currentPlaced;
      }
    } else {
      // Add word to placed
      updatedPlaced = [...currentPlaced, word];
    }

    setPlacedWords({ ...placedWords, [itemId]: updatedPlaced });
    if (checkedStatus[itemId]) {
      const updatedStatus = { ...checkedStatus };
      delete updatedStatus[itemId];
      setCheckedStatus(updatedStatus);
    }
  };

  const handleCheck = (itemId: string, targetSentence: string) => {
    const placed = placedWords[itemId] || [];
    const assembled = placed.join(' ').trim();
    const normalizedTarget = targetSentence.trim();

    // Check equality (stripping double spaces)
    const isCorrect = assembled.toLowerCase() === normalizedTarget.toLowerCase();

    setCheckedStatus({ ...checkedStatus, [itemId]: isCorrect });

    if (isCorrect) {
      sound.playCorrect();
    } else {
      sound.playIncorrect();
    }
  };

  const handleResetItem = (itemId: string) => {
    sound.playClick();
    setPlacedWords({ ...placedWords, [itemId]: [] });
    const status = { ...checkedStatus };
    delete status[itemId];
    setCheckedStatus(status);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {items.map((item, index) => {
        const placed = placedWords[item.id] || [];
        const isEvaluated = checkedStatus[item.id] !== undefined;
        const isCorrect = checkedStatus[item.id];

        // Calculate available words (accounting for duplicates)
        const availableWords = [...item.shuffledWords];
        placed.forEach((pWord) => {
          const idx = availableWords.indexOf(pWord);
          if (idx !== -1) {
            availableWords.splice(idx, 1);
          }
        });

        return (
          <div
            key={item.id}
            style={{
              background: 'var(--surface-subtle)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '20px 24px',
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '10px' }}>
              Предложение {index + 1} {item.hint && <span style={{ fontWeight: 400, color: 'var(--text-light)' }}>({item.hint})</span>}
            </div>

            {/* Target Dropzone / Assembled Area */}
            <div
              style={{
                background: varBgForDropzone(isEvaluated, isCorrect),
                border: varBorderForDropzone(isEvaluated, isCorrect),
                borderRadius: 'var(--radius-md)',
                padding: '16px 18px',
                minHeight: '60px',
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '8px',
                marginBottom: '16px',
                transition: 'all 0.2s ease',
              }}
            >
              {placed.length === 0 ? (
                <span style={{ color: 'var(--text-light)', fontSize: '14px', fontStyle: 'italic' }}>
                  Нажимайте на слова ниже, чтобы собрать фразу...
                </span>
              ) : (
                placed.map((word, wIdx) => (
                  <div
                    key={`${word}-${wIdx}`}
                    onClick={() => handleWordClick(item.id, word, true)}
                    style={{
                      background: 'var(--surface-white)',
                      border: '1.5px solid var(--primary-border)',
                      borderRadius: '8px',
                      padding: '7px 14px',
                      fontSize: '14.5px',
                      fontWeight: 600,
                      color: 'var(--primary)',
                      cursor: 'pointer',
                      boxShadow: 'var(--shadow-subtle)',
                      transition: 'all 0.15s ease',
                      userSelect: 'none',
                    }}
                    title="Кликните, чтобы убрать"
                  >
                    {word}
                  </div>
                ))
              )}
            </div>

            {/* Available Word Chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
              {availableWords.map((word, wIdx) => (
                <div
                  key={`${word}-avail-${wIdx}`}
                  onClick={() => handleWordClick(item.id, word, false)}
                  style={{
                    background: 'var(--surface-white)',
                    border: '1.5px solid var(--border-strong)',
                    borderRadius: '8px',
                    padding: '7px 14px',
                    fontSize: '14.5px',
                    fontWeight: 600,
                    color: 'var(--text-main)',
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-subtle)',
                    transition: 'all 0.15s ease',
                    userSelect: 'none',
                  }}
                >
                  {word}
                </div>
              ))}
            </div>

            {/* Item Footer */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '12px',
                borderTop: '1px solid var(--border-subtle)',
              }}
            >
              <div>
                {isEvaluated && (
                  <span
                    style={{
                      fontSize: '13.5px',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: isCorrect ? 'var(--success)' : 'var(--error)',
                    }}
                  >
                    {isCorrect ? (
                      <>
                        <CheckCircle2 size={16} />
                        Верно! Предложение собрано правильно.
                      </>
                    ) : (
                      'Порядок слов не совсем точен. Попробуйте еще раз!'
                    )}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '13px' }}
                  onClick={() => handleResetItem(item.id)}
                >
                  <RotateCcw size={14} />
                  Очистить
                </button>
                <button
                  className="btn btn-primary"
                  style={{ padding: '6px 14px', fontSize: '13px' }}
                  onClick={() => handleCheck(item.id, item.targetSentence)}
                  disabled={placed.length === 0}
                >
                  Проверить
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

function varBgForDropzone(evaluated: boolean, correct?: boolean): string {
  if (!evaluated) return 'var(--surface-white)';
  return correct ? 'var(--success-subtle)' : 'var(--error-subtle)';
}

function varBorderForDropzone(evaluated: boolean, correct?: boolean): string {
  if (!evaluated) return '2px dashed var(--border-strong)';
  return correct ? '2px solid var(--success-border)' : '2px solid var(--error-border)';
}
