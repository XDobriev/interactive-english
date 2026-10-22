import React, { useState, useEffect } from 'react';
import { CheckCircle2, RotateCcw } from 'lucide-react';
import type { MatchPairsData, MatchPairItem } from '../../types';
import { sound } from '../../utils/audio';

interface MatchPairsProps {
  data: MatchPairsData;
  showAnswers?: boolean;
}

export const MatchPairsExercise: React.FC<MatchPairsProps> = ({
  data,
  showAnswers = false,
}) => {
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Set<string>>(new Set());
  const [shuffledRight, setShuffledRight] = useState<MatchPairItem[]>([]);
  const [errorPair, setErrorPair] = useState<{ left: string; right: string } | null>(null);

  // Normalize pairs defensively against LLM variations
  const rawPairs = Array.isArray(data?.pairs)
    ? data.pairs
    : Array.isArray(data)
    ? data
    : [];
  const pairs: MatchPairItem[] = rawPairs.map((p: any, idx: number) => ({
    id: p.id || `pair-${idx}`,
    leftText: p.leftText ?? p.left ?? '',
    rightText: p.rightText ?? p.right ?? '',
  }));

  useEffect(() => {
    // Shuffle right items on load
    const rightList = [...pairs].sort(() => Math.random() - 0.5);
    setShuffledRight(rightList);
    setMatchedPairs(new Set());
    setSelectedLeft(null);
  }, [pairs.length]);

  useEffect(() => {
    if (showAnswers) {
      const allMatched = new Set(pairs.map((p) => p.id));
      setMatchedPairs(allMatched);
      setSelectedLeft(null);
    }
  }, [showAnswers, pairs.length]);

  const handleLeftClick = (id: string) => {
    if (matchedPairs.has(id)) return;
    sound.playClick();
    setSelectedLeft(id === selectedLeft ? null : id);
    setErrorPair(null);
  };

  const handleRightClick = (rightItem: MatchPairItem) => {
    if (matchedPairs.has(rightItem.id) || !selectedLeft) return;

    if (selectedLeft === rightItem.id) {
      // Correct Match!
      sound.playCorrect();
      const updated = new Set(matchedPairs);
      updated.add(rightItem.id);
      setMatchedPairs(updated);
      setSelectedLeft(null);
      setErrorPair(null);
    } else {
      // Mismatch
      sound.playIncorrect();
      setErrorPair({ left: selectedLeft, right: rightItem.id });
      setTimeout(() => {
        setErrorPair(null);
        setSelectedLeft(null);
      }, 700);
    }
  };

  const handleReset = () => {
    sound.playClick();
    setMatchedPairs(new Set());
    setSelectedLeft(null);
    setErrorPair(null);
    setShuffledRight([...data.pairs].sort(() => Math.random() - 0.5));
  };

  const isAllMatched = matchedPairs.size === data.pairs.length;

  return (
    <div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          marginBottom: '20px',
        }}
      >
        {/* Left Column (Terms) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase' }}>
            Английские выражения
          </div>
          {data.pairs.map((item) => {
            const isMatched = matchedPairs.has(item.id);
            const isSelected = selectedLeft === item.id;
            const isError = errorPair?.left === item.id;

            let border = '1.5px solid var(--border-subtle)';
            let bg = 'var(--surface-white)';
            let text = 'var(--text-main)';

            if (isMatched) {
              border = '1.5px solid var(--success-border)';
              bg = 'var(--success-subtle)';
              text = 'var(--success-text)';
            } else if (isError) {
              border = '1.5px solid var(--error)';
              bg = 'var(--error-subtle)';
              text = 'var(--error-text)';
            } else if (isSelected) {
              border = '2px solid var(--primary)';
              bg = 'var(--primary-subtle)';
              text = 'var(--primary)';
            }

            return (
              <div
                key={item.id}
                onClick={() => handleLeftClick(item.id)}
                style={{
                  padding: '14px 18px',
                  borderRadius: '10px',
                  border,
                  background: bg,
                  color: text,
                  fontWeight: 600,
                  fontSize: '14.5px',
                  cursor: isMatched ? 'default' : 'pointer',
                  boxShadow: isSelected ? '0 0 0 3px rgba(79, 70, 229, 0.15)' : 'var(--shadow-subtle)',
                  transition: 'all 0.15s ease',
                  userSelect: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span>{item.leftText}</span>
                {isMatched && <CheckCircle2 size={16} color="var(--success)" />}
              </div>
            );
          })}
        </div>

        {/* Right Column (Translations/Definitions) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase' }}>
            Значение / Перевод
          </div>
          {shuffledRight.map((item) => {
            const isMatched = matchedPairs.has(item.id);
            const isError = errorPair?.right === item.id;

            let border = '1.5px solid var(--border-subtle)';
            let bg = 'var(--surface-white)';
            let text = 'var(--text-main)';

            if (isMatched) {
              border = '1.5px solid var(--success-border)';
              bg = 'var(--success-subtle)';
              text = 'var(--success-text)';
            } else if (isError) {
              border = '1.5px solid var(--error)';
              bg = 'var(--error-subtle)';
              text = 'var(--error-text)';
            }

            return (
              <div
                key={item.id}
                onClick={() => handleRightClick(item)}
                style={{
                  padding: '14px 18px',
                  borderRadius: '10px',
                  border,
                  background: bg,
                  color: text,
                  fontWeight: 500,
                  fontSize: '14px',
                  cursor: isMatched ? 'default' : selectedLeft ? 'pointer' : 'default',
                  boxShadow: 'var(--shadow-subtle)',
                  transition: 'all 0.15s ease',
                  userSelect: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span>{item.rightText}</span>
                {isMatched && <CheckCircle2 size={16} color="var(--success)" />}
              </div>
            );
          })}
        </div>
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
          {isAllMatched ? (
            <span
              style={{
                fontSize: '13.5px',
                fontWeight: 700,
                color: 'var(--success)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <CheckCircle2 size={16} />
              Все пары соединены верно!
            </span>
          ) : (
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Соединено: {matchedPairs.size} из {data.pairs.length}
            </span>
          )}
        </div>

        <button className="btn btn-secondary" onClick={handleReset}>
          <RotateCcw size={15} />
          Сбросить пары
        </button>
      </div>
    </div>
  );
};
