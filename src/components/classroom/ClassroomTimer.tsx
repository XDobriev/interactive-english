import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Timer, Play, Pause, RotateCcw, X } from 'lucide-react';
import { syncPost, syncSubscribe } from '../../services/syncChannel';
import { sound } from '../../utils/audio';

interface ClassroomTimerProps {
  onClose?: () => void;
  broadcastChannelName?: string;
  isTeacher?: boolean;
}

export const ClassroomTimer: React.FC<ClassroomTimerProps> = ({
  onClose,
  broadcastChannelName,
  isTeacher = true,
}) => {
  const [secondsLeft, setSecondsLeft] = useState<number>(120); // 2 minutes default
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [initialDuration, setInitialDuration] = useState<number>(120);
  const timerRef = useRef<number | null>(null);

  // Sync with the student / teacher view if a channel is provided
  useEffect(() => {
    if (!broadcastChannelName) return;
    return syncSubscribe<{ type: string; secondsLeft: number; isRunning: boolean; initialDuration: number }>(
      broadcastChannelName,
      (data) => {
        if (data.type === 'TIMER_SYNC') {
          setSecondsLeft(data.secondsLeft);
          setIsRunning(data.isRunning);
          setInitialDuration(data.initialDuration);
        }
      }
    );
  }, [broadcastChannelName]);

  const broadcastTimer = useCallback(
    (nextSeconds: number, running: boolean, duration: number) => {
      if (!broadcastChannelName) return;
      syncPost(broadcastChannelName, {
        type: 'TIMER_SYNC',
        secondsLeft: nextSeconds,
        isRunning: running,
        initialDuration: duration,
      });
    },
    [broadcastChannelName]
  );

  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            sound.playTimerDing();
            if (isTeacher) {
              broadcastTimer(0, false, initialDuration);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, initialDuration, isTeacher, broadcastTimer]);

  const handleStartPause = () => {
    sound.playClick();
    const nextState = !isRunning;
    setIsRunning(nextState);
    if (isTeacher) {
      broadcastTimer(secondsLeft, nextState, initialDuration);
    }
  };

  const handleReset = () => {
    sound.playClick();
    setIsRunning(false);
    setSecondsLeft(initialDuration);
    if (isTeacher) {
      broadcastTimer(initialDuration, false, initialDuration);
    }
  };

  const handleSetPreset = (secs: number) => {
    sound.playClick();
    setIsRunning(false);
    setInitialDuration(secs);
    setSecondsLeft(secs);
    if (isTeacher) {
      broadcastTimer(secs, false, secs);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = initialDuration > 0 ? (secondsLeft / initialDuration) * 100 : 0;

  return (
    <div
      style={{
        background: 'var(--surface-white)',
        border: '1.5px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '16px 20px',
        boxShadow: 'var(--shadow-float)',
        width: '280px',
        position: 'relative',
        zIndex: 50,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '13px', color: 'var(--text-main)' }}>
          <Timer size={16} color="var(--primary)" />
          <span>Таймер задания</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)', padding: 0 }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Digits Display */}
      <div style={{ textAlign: 'center', marginBottom: '14px' }}>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '34px',
            fontWeight: 800,
            letterSpacing: '0.04em',
            color: secondsLeft === 0 ? 'var(--error)' : secondsLeft < 30 ? 'var(--warning)' : 'var(--text-main)',
            transition: 'color 0.3s ease',
          }}
        >
          {formatTime(secondsLeft)}
        </div>

        {/* Progress Bar */}
        <div style={{ width: '100%', height: '5px', background: 'var(--surface-subtle)', borderRadius: '3px', marginTop: '6px', overflow: 'hidden' }}>
          <div
            style={{
              width: `${progress}%`,
              height: '100%',
              background: secondsLeft === 0 ? 'var(--error)' : 'var(--primary)',
              transition: 'width 1s linear',
            }}
          />
        </div>
      </div>

      {/* Preset Buttons */}
      {isTeacher && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginBottom: '14px' }}>
          {[
            { label: '1м', sec: 60 },
            { label: '2м', sec: 120 },
            { label: '5м', sec: 300 },
            { label: '10м', sec: 600 },
          ].map((preset) => (
            <button
              key={preset.sec}
              onClick={() => handleSetPreset(preset.sec)}
              style={{
                border: initialDuration === preset.sec ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                background: initialDuration === preset.sec ? 'var(--primary-subtle)' : 'var(--surface-subtle)',
                color: initialDuration === preset.sec ? 'var(--primary)' : 'var(--text-main)',
                fontSize: '11.5px',
                fontWeight: 700,
                borderRadius: '6px',
                padding: '4px 0',
                cursor: 'pointer',
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}

      {/* Controls */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {isTeacher ? (
          <>
            <button
              className="btn btn-primary"
              style={{ flex: 1, padding: '7px 0', justifyContent: 'center', fontSize: '13px' }}
              onClick={handleStartPause}
            >
              {isRunning ? <Pause size={15} /> : <Play size={15} />}
              {isRunning ? 'Пауза' : 'Старт'}
            </button>
            <button
              className="btn btn-secondary"
              style={{ padding: '7px 12px' }}
              onClick={handleReset}
              title="Сброс таймера"
            >
              <RotateCcw size={15} />
            </button>
          </>
        ) : (
          <div style={{ width: '100%', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
            {isRunning ? '⏳ Идет отсчет времени' : secondsLeft === 0 ? '🔔 Время вышло!' : 'Ожидание учителя'}
          </div>
        )}
      </div>
    </div>
  );
};
