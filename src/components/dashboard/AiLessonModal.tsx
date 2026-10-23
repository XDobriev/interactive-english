import React, { useState } from 'react';
import { X, Sparkles, Loader2 } from 'lucide-react';
import type { Lesson, CEFRLevel } from '../../types';
import { generateFullLessonWithGemini } from '../../services/gemini';
import { sound } from '../../utils/audio';

interface AiLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLessonGenerated: (lesson: Lesson) => void;
}

export const AiLessonModal: React.FC<AiLessonModalProps> = ({
  isOpen,
  onClose,
  onLessonGenerated,
}) => {
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState<CEFRLevel>('B1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setIsGenerating(true);
    setError(null);
    sound.playClick();
    try {
      const newLesson = await generateFullLessonWithGemini(topic.trim(), level);
      sound.playLessonComplete();
      onLessonGenerated(newLesson);
      onClose();
      setTopic('');
    } catch (err: any) {
      console.error('Failed to generate full lesson with Gemini:', err);
      sound.playIncorrect();
      setError(
        err?.message ||
          'Не удалось сгенерировать урок. Проверьте подключение или укажите собственный Gemini API ключ в настройках.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 120,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        className="app-card animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '560px',
          padding: '28px',
          position: 'relative',
          borderRadius: '20px',
          boxShadow: 'var(--shadow-float)',
        }}
      >
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          disabled={isGenerating}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-muted)',
          }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Sparkles size={18} />
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              Генератор урока с Gemini AI
            </h2>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: 0 }}>
              Создание интерактивного урока под ключ за несколько секунд
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', margin: '20px 0' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
              Тема или ситуация урока (на русском или английском):
            </label>
            <input
              type="text"
              placeholder="Например: Booking a Hotel Room & Resolving Issues"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={isGenerating}
              style={{
                width: '100%',
                fontFamily: 'inherit',
                fontSize: '14.5px',
                padding: '11px 14px',
                borderRadius: '10px',
                border: '1.5px solid var(--border-strong)',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
              Целевой уровень (CEFR):
            </label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value as CEFRLevel)}
              disabled={isGenerating}
              style={{
                width: '100%',
                fontFamily: 'inherit',
                fontSize: '14px',
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1.5px solid var(--border-strong)',
                outline: 'none',
                boxSizing: 'border-box',
                fontWeight: 600,
              }}
            >
              <option value="A1">A1 Beginner</option>
              <option value="A2">A2 Elementary</option>
              <option value="B1">B1 Intermediate</option>
              <option value="B2">B2 Upper-Intermediate</option>
              <option value="C1">C1 Advanced</option>
            </select>
          </div>

          {/* Quick Prompt Ideas */}
          <div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-light)', display: 'block', marginBottom: '6px' }}>
              Быстрые популярные темы:
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {[
                'At a London Café (A2)',
                'Job Interview & Business English (B2)',
                'Lost Luggage at the Airport (B1)',
                'Small Talk & First Meetings (A1)',
                'Persuasion & Rhetoric (C1)',
              ].map((idea) => (
                <button
                  key={idea}
                  type="button"
                  onClick={() => {
                    const levelMatch = idea.match(/\(([A-C][1-2])\)/);
                    const cleanTopic = idea.replace(/\s*\([A-C][1-2]\)/, '');
                    setTopic(cleanTopic);
                    if (levelMatch) setLevel(levelMatch[1] as CEFRLevel);
                  }}
                  style={{
                    border: '1px solid #c7d2fe',
                    background: '#eef2ff',
                    color: 'var(--primary)',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {idea}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div style={{ color: 'var(--error)', fontSize: '12px', fontWeight: 600 }}>
              ⚠️ {error}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            disabled={isGenerating}
          >
            Отмена
          </button>

          <button
            type="button"
            disabled={isGenerating || !topic.trim()}
            onClick={handleGenerate}
            style={{
              background: isGenerating ? '#94a3b8' : 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              padding: '11px 22px',
              fontSize: '14px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: isGenerating ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)',
            }}
          >
            {isGenerating ? (
              <>
                <Loader2 size={16} className="spin-animate" />
                Составляю урок с Gemini...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Сгенерировать урок
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
