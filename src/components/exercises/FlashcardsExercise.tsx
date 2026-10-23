import React, { useMemo, useState } from 'react';
import { Volume2, ArrowLeft, ArrowRight, Shuffle, Check, HelpCircle } from 'lucide-react';
import type { FlashcardItem, FlashcardsData } from '../../types';
import { speakEnglish } from '../../utils/speech';
import { sound } from '../../utils/audio';
import { normalizeFlashcards } from '../../utils/exerciseNormalize';

interface FlashcardsProps {
  data: FlashcardsData;
}

export const FlashcardsExercise: React.FC<FlashcardsProps> = ({ data }) => {
  const normalizedCards = useMemo(() => normalizeFlashcards(data), [data]);
  // Remount (resetting deck order and progress) when the cards change
  return <FlashcardsDeck key={JSON.stringify(normalizedCards)} initialCards={normalizedCards} />;
};

const FlashcardsDeck: React.FC<{ initialCards: FlashcardItem[] }> = ({ initialCards }) => {
  const [cards, setCards] = useState(initialCards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [mastered, setMastered] = useState<Record<string, boolean>>({});

  if (cards.length === 0) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
        Карточки формируются...
      </div>
    );
  }

  const currentCard = cards[currentIndex] || cards[0];

  const handleFlip = () => {
    sound.playClick();
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    sound.playClick();
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    sound.playClick();
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const handleShuffle = () => {
    sound.playClick();
    setIsFlipped(false);
    setCards([...cards].sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
  };

  const toggleMastered = (id: string, isKnown: boolean) => {
    sound.playClick();
    setMastered({ ...mastered, [id]: isKnown });
    handleNext();
  };

  const handlePronounce = (e: React.MouseEvent, word: string) => {
    e.stopPropagation();
    speakEnglish(word);
  };

  if (!currentCard) return null;

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
      
      {/* Top Controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
          color: 'var(--text-muted)',
          fontSize: '13.5px',
          fontWeight: 600,
        }}
      >
        <span>
          Карточка {currentIndex + 1} из {cards.length}
        </span>
        <button
          className="btn btn-secondary"
          style={{ padding: '5px 12px', fontSize: '12.5px' }}
          onClick={handleShuffle}
        >
          <Shuffle size={14} />
          Перемешать
        </button>
      </div>

      {/* 3D Flip Card Container */}
      <div className="perspective-container" onClick={handleFlip} style={{ marginBottom: '24px' }}>
        <div className={`flashcard-inner ${isFlipped ? 'flipped' : ''}`}>
          
          {/* FRONT */}
          <div className="flashcard-face">
            <div style={{ position: 'absolute', top: '18px', right: '18px' }}>
              <button
                className="speaker-button"
                onClick={(e) => handlePronounce(e, currentCard.term)}
                title="Послушать произношение"
              >
                <Volume2 size={18} />
              </button>
            </div>

            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-light)', fontWeight: 800, marginBottom: '8px' }}>
              English Term
            </div>

            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 800, color: 'var(--primary)', marginBottom: '8px' }}>
              {currentCard.term}
            </h2>

            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '15px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              {currentCard.transcription}
            </div>

            <div style={{ fontSize: '13px', color: 'var(--text-light)', fontStyle: 'italic', marginTop: 'auto' }}>
              Нажмите, чтобы перевернуть карточку ↷
            </div>
          </div>

          {/* BACK */}
          <div className="flashcard-face flashcard-back">
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--primary)', fontWeight: 800, marginBottom: '6px' }}>
              Перевод & Определение
            </div>

            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '12px' }}>
              {currentCard.translation}
            </h3>

            {currentCard.definitionEn && (
              <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '14px', maxWidth: '440px', lineHeight: 1.5 }}>
                {currentCard.definitionEn}
              </div>
            )}

            <div
              style={{
                fontSize: '14px',
                fontStyle: 'italic',
                color: 'var(--primary)',
                background: 'var(--surface-white)',
                padding: '10px 16px',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
                maxWidth: '480px',
              }}
            >
              "{currentCard.exampleSentence}"
            </div>
          </div>

        </div>
      </div>

      {/* Navigation & Learning Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px' }}>
        <button className="btn btn-secondary" onClick={handlePrev}>
          <ArrowLeft size={16} />
          Назад
        </button>

        <button
          className="btn btn-secondary"
          style={{ borderColor: 'var(--teacher-border)', color: 'var(--teacher-text)' }}
          onClick={() => toggleMastered(currentCard.id, false)}
        >
          <HelpCircle size={16} />
          Повторить позже
        </button>

        <button
          className="btn btn-primary"
          style={{ background: 'var(--success)' }}
          onClick={() => toggleMastered(currentCard.id, true)}
        >
          <Check size={16} />
          Знаю это слово
        </button>

        <button className="btn btn-secondary" onClick={handleNext}>
          Вперёд
          <ArrowRight size={16} />
        </button>
      </div>

    </div>
  );
};
