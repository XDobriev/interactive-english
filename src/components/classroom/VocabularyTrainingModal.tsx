import React, { useState } from 'react';
import { Volume2, X, Check, ArrowRight, RotateCcw, Award } from 'lucide-react';
import type { VocabWord } from '../../types';
import { speakEnglish } from '../../utils/speech';
import { sound } from '../../utils/audio';
import confetti from 'canvas-confetti';

interface VocabularyTrainingModalProps {
  vocabulary: VocabWord[];
  onClose: () => void;
}

export const VocabularyTrainingModal: React.FC<VocabularyTrainingModalProps> = ({
  vocabulary,
  onClose,
}) => {
  const [shuffled] = useState(() => [...vocabulary].sort(() => Math.random() - 0.5));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const currentWord = shuffled[currentIndex];

  // Generate 4 multiple-choice options (1 correct + 3 random distractors)
  const [options, setOptions] = useState<string[]>(() => {
    return generateOptions(currentWord, vocabulary);
  });

  function generateOptions(target: VocabWord, all: VocabWord[]): string[] {
    const wrong = all.filter((w) => w.id !== target.id).map((w) => w.translation);
    const shuffledWrong = [...wrong].sort(() => Math.random() - 0.5).slice(0, 3);
    const pool = [target.translation, ...shuffledWrong];
    return pool.sort(() => Math.random() - 0.5);
  }

  const handleSelectOption = (opt: string) => {
    if (isAnswered) return;
    sound.playClick();
    setSelectedOption(opt);
    setIsAnswered(true);

    if (opt === currentWord.translation) {
      sound.playCorrect();
      setScore((s) => s + 1);
    } else {
      sound.playIncorrect();
    }
  };

  const handleNext = () => {
    sound.playClick();
    if (currentIndex < shuffled.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setSelectedOption(null);
      setIsAnswered(false);
      setOptions(generateOptions(shuffled[nextIdx], vocabulary));
    } else {
      setIsFinished(true);
      sound.playLessonComplete();
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    }
  };

  const handleRestart = () => {
    sound.playClick();
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setIsFinished(false);
    setOptions(generateOptions(shuffled[0], vocabulary));
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        style={{
          background: 'var(--surface-white)',
          borderRadius: 'var(--radius-lg)',
          width: '100%',
          maxWidth: '520px',
          padding: '28px 32px',
          boxShadow: 'var(--shadow-float)',
          position: 'relative',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-light)',
          }}
        >
          <X size={20} />
        </button>

        {!isFinished ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Тренировка слов • {currentIndex + 1} из {shuffled.length}
              </span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary)' }}>
                Счет: {score}
              </span>
            </div>

            {/* Target Word Card */}
            <div
              style={{
                textAlign: 'center',
                padding: '28px 20px',
                background: 'var(--surface-subtle)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '24px',
              }}
            >
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 800, color: 'var(--text-main)' }}>
                  {currentWord.term}
                </span>
                <button
                  className="speaker-button"
                  onClick={() => speakEnglish(currentWord.term)}
                  title="Озвучить"
                >
                  <Volume2 size={18} />
                </button>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {currentWord.transcription}
              </div>
              {currentWord.contextSentence && (
                <div style={{ marginTop: '10px', fontSize: '13px', color: 'var(--text-light)', fontStyle: 'italic' }}>
                  "{currentWord.contextSentence}"
                </div>
              )}
            </div>

            {/* Multiple Choice Options */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px', marginBottom: '20px' }}>
              {options.map((opt, oIdx) => {
                const isSelected = selectedOption === opt;
                const isCorrect = opt === currentWord.translation;

                let btnBg = 'var(--surface-white)';
                let btnBorder = '1.5px solid var(--border-subtle)';
                let btnColor = 'var(--text-main)';

                if (isAnswered) {
                  if (isCorrect) {
                    btnBg = 'var(--success-subtle)';
                    btnBorder = '1.5px solid var(--success-border)';
                    btnColor = 'var(--success)';
                  } else if (isSelected) {
                    btnBg = 'var(--error-subtle)';
                    btnBorder = '1.5px solid var(--error-border)';
                    btnColor = 'var(--error)';
                  }
                } else if (isSelected) {
                  btnBorder = '1.5px solid var(--primary)';
                  btnBg = 'var(--primary-subtle)';
                }

                return (
                  <button
                    key={oIdx}
                    onClick={() => handleSelectOption(opt)}
                    disabled={isAnswered}
                    style={{
                      padding: '12px 18px',
                      borderRadius: 'var(--radius-sm)',
                      background: btnBg,
                      border: btnBorder,
                      color: btnColor,
                      fontSize: '14.5px',
                      fontWeight: 600,
                      textAlign: 'left',
                      cursor: isAnswered ? 'default' : 'pointer',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span>{opt}</span>
                    {isAnswered && isCorrect && <Check size={16} />}
                  </button>
                );
              })}
            </div>

            {/* Next Button */}
            {isAnswered && (
              <button
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '12px 0' }}
                onClick={handleNext}
              >
                <span>{currentIndex < shuffled.length - 1 ? 'Следующее слово' : 'Посмотреть результат'}</span>
                <ArrowRight size={16} />
              </button>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <Award size={54} color="var(--primary)" style={{ margin: '0 auto 16px' }} />
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>
              Тренировка завершена!
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginBottom: '24px' }}>
              Правильных ответов: <strong>{score}</strong> из <strong>{shuffled.length}</strong> ({Math.round((score / shuffled.length) * 100)}%)
            </p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button className="btn btn-secondary" onClick={handleRestart}>
                <RotateCcw size={16} />
                Пройти ещё раз
              </button>
              <button className="btn btn-primary" onClick={onClose}>
                Вернуться к уроку
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
