import React, { useState } from 'react';
import { MessageSquare, Sparkles, Volume2, Play, Pause, RotateCcw } from 'lucide-react';
import type { MediaRuleData } from '../../types';
import { speakEnglish, stopEnglishSpeech } from '../../utils/speech';
import { sound } from '../../utils/audio';

interface MediaRuleProps {
  data: MediaRuleData;
}

export const MediaRuleExercise: React.FC<MediaRuleProps> = ({ data }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<0.8 | 1.0 | 1.2>(1.0);

  const handlePlayToggle = () => {
    sound.playClick();
    if (isPlaying) {
      stopEnglishSpeech();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      // Read rule content / dialogue aloud in natural English
      speakEnglish(data.markdownContent, {
        rate: speed,
        onEnd: () => setIsPlaying(false),
      });
    }
  };

  const handleSpeedChange = (newSpeed: 0.8 | 1.0 | 1.2) => {
    sound.playClick();
    setSpeed(newSpeed);
    if (isPlaying) {
      stopEnglishSpeech();
      setIsPlaying(true);
      speakEnglish(data.markdownContent, {
        rate: newSpeed,
        onEnd: () => setIsPlaying(false),
      });
    }
  };

  const handleReplay = () => {
    sound.playClick();
    stopEnglishSpeech();
    setIsPlaying(true);
    speakEnglish(data.markdownContent, {
      rate: speed,
      onEnd: () => setIsPlaying(false),
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Audio Player Bar (ProgressMe English feature) */}
      <div
        style={{
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          border: '1.5px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={handlePlayToggle}
            className="btn btn-primary"
            style={{
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              padding: 0,
              justifyContent: 'center',
            }}
            title={isPlaying ? 'Пауза' : 'Слушать аудио правила'}
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} style={{ marginLeft: '2px' }} />}
          </button>

          <button
            onClick={handleReplay}
            className="btn btn-secondary"
            style={{ padding: '6px 10px', fontSize: '12px' }}
            title="Воспроизвести сначала"
          >
            <RotateCcw size={14} />
          </button>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>
              <Volume2 size={15} color="var(--primary)" />
              <span>Озвучка текста / Диалога</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-light)' }}>
              {isPlaying ? '▶ Воспроизведение...' : 'Нажмите Play для тренировки аудирования'}
            </div>
          </div>
        </div>

        {/* Speed Selector (ProgressMe style) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '11.5px', color: 'var(--text-light)', marginRight: '4px', fontWeight: 600 }}>
            Скорость:
          </span>
          {([0.8, 1.0, 1.2] as const).map((s) => (
            <button
              key={s}
              onClick={() => handleSpeedChange(s)}
              style={{
                border: speed === s ? '1.5px solid var(--primary)' : '1px solid var(--border-subtle)',
                background: speed === s ? 'var(--primary-subtle)' : 'var(--surface-white)',
                color: speed === s ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: 700,
                fontSize: '11.5px',
                padding: '4px 8px',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Rule Content Box */}
      <div
        style={{
          background: 'var(--surface-subtle)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '24px 28px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: 'var(--font-display)',
            fontSize: '13px',
            fontWeight: 800,
            color: 'var(--primary)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '12px',
          }}
        >
          <Sparkles size={16} />
          {data.ruleTitle}
        </div>

        <div
          style={{
            fontSize: '15px',
            lineHeight: 1.8,
            color: 'var(--text-main)',
            whiteSpace: 'pre-line',
          }}
        >
          {data.markdownContent}
        </div>
      </div>

      {/* Discussion Prompts */}
      {data.discussionPrompts && data.discussionPrompts.length > 0 && (
        <div
          style={{
            background: 'var(--primary-subtle)',
            border: '1px solid var(--primary-border)',
            borderRadius: 'var(--radius-md)',
            padding: '20px 24px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: 'var(--font-display)',
              fontSize: '13px',
              fontWeight: 700,
              color: 'var(--primary)',
              marginBottom: '10px',
            }}
          >
            <MessageSquare size={16} />
            Темы для устного обсуждения (Speaking output):
          </div>

          <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {data.discussionPrompts.map((prompt, pIdx) => (
              <li key={pIdx} style={{ fontSize: '14.5px', color: 'var(--text-main)', lineHeight: 1.5 }}>
                {prompt}
              </li>
            ))}
          </ul>
        </div>
      )}

    </div>
  );
};
