import React from 'react';
import { Eye } from 'lucide-react';
import type {
  Exercise,
  FillBlanksData,
  FlashcardsData,
  MatchPairsData,
  MediaRuleData,
  QuizData,
  WordOrderData,
} from '../../types';
import { FillInBlanksExercise } from '../exercises/FillInBlanksExercise';
import { MatchPairsExercise } from '../exercises/MatchPairsExercise';
import { WordOrderExercise } from '../exercises/WordOrderExercise';
import { FlashcardsExercise } from '../exercises/FlashcardsExercise';
import { QuizExercise } from '../exercises/QuizExercise';
import { MediaRuleExercise } from '../exercises/MediaRuleExercise';
interface LivePreviewPaneProps {
  exercise: Exercise;
}

export const LivePreviewPane: React.FC<LivePreviewPaneProps> = ({
  exercise: currentPreviewExercise,
}) => {
  const selectedType = currentPreviewExercise.type;
  const scoreWeight = currentPreviewExercise.scoreWeight;
  return (
    <div
      style={{
        flex: 1,
        background: '#f1f5f9',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Simulator Header */}
      <div
        style={{
          padding: '14px 20px',
          background: '#ffffff',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Eye size={16} color="var(--primary)" />
          <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-main)' }}>
            Интерактивный вид ученика
          </span>
          <span
            style={{
              background: 'var(--success-subtle)',
              color: 'var(--success)',
              fontSize: '11px',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '12px',
            }}
          >
            {scoreWeight} {scoreWeight === 1 ? 'балл' : scoreWeight < 5 ? 'балла' : 'баллов'}
          </span>
        </div>

        <div style={{ fontSize: '12px', color: 'var(--text-light)' }}>
          Обновляется в реальном времени при вводе
        </div>
      </div>

      {/* Live Preview Exercise Engine Container */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        {/* Simulated Exercise Header */}
        <div
          style={{
            background: '#ffffff',
            padding: '20px',
            borderRadius: '14px',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span
              style={{
                background: 'var(--primary-subtle)',
                color: 'var(--primary)',
                padding: '3px 8px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 800,
                textTransform: 'uppercase',
              }}
            >
              {currentPreviewExercise.type}
            </span>
            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>
              {currentPreviewExercise.title}
            </h4>
          </div>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
            {currentPreviewExercise.instruction}
          </p>
        </div>

        {/* Simulated Interactive Engine Body */}
        <div
          style={{
            background: '#ffffff',
            padding: '24px',
            borderRadius: '14px',
            boxShadow: 'var(--shadow-card)',
            minHeight: '260px',
          }}
        >
          {selectedType === 'fill_blanks' && (
            <FillInBlanksExercise
              key={JSON.stringify(currentPreviewExercise.data)}
              data={currentPreviewExercise.data as FillBlanksData}
            />
          )}

          {selectedType === 'match_pairs' && (
            <MatchPairsExercise
              key={JSON.stringify(currentPreviewExercise.data)}
              data={currentPreviewExercise.data as MatchPairsData}
            />
          )}

          {selectedType === 'word_order' && (
            <WordOrderExercise
              key={JSON.stringify(currentPreviewExercise.data)}
              data={currentPreviewExercise.data as WordOrderData}
            />
          )}

          {selectedType === 'flashcards' && (
            <FlashcardsExercise
              key={JSON.stringify(currentPreviewExercise.data)}
              data={currentPreviewExercise.data as FlashcardsData}
            />
          )}

          {selectedType === 'quiz' && (
            <QuizExercise
              key={JSON.stringify(currentPreviewExercise.data)}
              data={currentPreviewExercise.data as QuizData}
            />
          )}

          {selectedType === 'media_rule' && (
            <MediaRuleExercise
              key={JSON.stringify(currentPreviewExercise.data)}
              data={currentPreviewExercise.data as MediaRuleData}
            />
          )}
        </div>
      </div>
    </div>
  );
};
