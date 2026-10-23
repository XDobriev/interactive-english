import React from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import type { CEFRLevel, ExerciseType } from '../../types';

interface AiPromptBarProps {
  selectedType: ExerciseType;
  aiPrompt: string;
  onPromptChange: (value: string) => void;
  aiLevel: CEFRLevel;
  onLevelChange: (level: CEFRLevel) => void;
  isGenerating: boolean;
  error: string | null;
  onGenerate: () => void;
}

export const AiPromptBar: React.FC<AiPromptBarProps> = ({
  selectedType,
  aiPrompt,
  onPromptChange: setAiPrompt,
  aiLevel,
  onLevelChange: setAiLevel,
  isGenerating: isGeneratingAi,
  error: aiError,
  onGenerate: handleGenerateWithAI,
}) => {
  return (
      <div
        style={{
          background: 'linear-gradient(135deg, #f5f3ff 0%, #eef2ff 100%)',
          borderBottom: '1.5px solid #c7d2fe',
          padding: '16px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          animation: 'fadeIn 0.2s ease-out',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="var(--primary)" />
            <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-main)' }}>
              Генератор упражнений с Google Gemini AI
            </span>
            <span
              style={{
                fontSize: '11px',
                background: '#c7d2fe',
                color: '#4338ca',
                padding: '2px 8px',
                borderRadius: '6px',
                fontWeight: 800,
              }}
            >
              {selectedType.toUpperCase()}
            </span>
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Опишите любую тему, диалог или грамматику — Gemini составит задание за 2 секунды
          </span>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleGenerateWithAI();
            }}
            placeholder="Например: Past Simple vs Continuous в аэропорту, Фразовые глаголы с LOOK, Заказ еды в ресторане..."
            style={{
              flex: 1,
              fontFamily: 'inherit',
              fontSize: '14px',
              padding: '10px 14px',
              borderRadius: '10px',
              border: '1.5px solid #a5b4fc',
              background: '#ffffff',
              outline: 'none',
            }}
          />

          <select
            value={aiLevel}
            onChange={(e) => setAiLevel(e.target.value as CEFRLevel)}
            style={{
              padding: '10px 14px',
              borderRadius: '10px',
              border: '1.5px solid #a5b4fc',
              background: '#ffffff',
              fontWeight: 700,
              fontSize: '13px',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="A1">A1 Beginner</option>
            <option value="A2">A2 Elementary</option>
            <option value="B1">B1 Intermediate</option>
            <option value="B2">B2 Upper-Int</option>
            <option value="C1">C1 Advanced</option>
          </select>

          <button
            type="button"
            disabled={isGeneratingAi || !aiPrompt.trim()}
            onClick={handleGenerateWithAI}
            style={{
              padding: '10px 22px',
              borderRadius: '10px',
              border: 'none',
              background: isGeneratingAi ? '#94a3b8' : 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '13.5px',
              cursor: isGeneratingAi ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
              whiteSpace: 'nowrap',
            }}
          >
            {isGeneratingAi ? (
              <>
                <Loader2 size={16} className="spin-animate" />
                Генерирую...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Сгенерировать
              </>
            )}
          </button>
        </div>

        {aiError && (
          <div style={{ color: 'var(--error)', fontSize: '12px', fontWeight: 600 }}>
            ⚠️ {aiError}
          </div>
        )}
      </div>
  );
};
