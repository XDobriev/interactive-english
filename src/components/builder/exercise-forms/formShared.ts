import type React from 'react';
import type { ExerciseDraft } from '../exerciseDraft';

export interface FormProps {
  draft: ExerciseDraft;
  onChange: (patch: Partial<ExerciseDraft>) => void;
}

// Web Speech API helper for pronouncing English words/phrases
export const speakEnglish = (text: string, accent: 'en-GB' | 'en-US' = 'en-GB', rate = 1.0) => {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = accent;
    utterance.rate = rate;
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('SpeechSynthesis error:', err);
  }
};

// Reusable micro-styles
export const subLabelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '11px',
  fontWeight: 700,
  color: 'var(--text-muted)',
  marginBottom: '6px',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};

export const fieldInputStyle: React.CSSProperties = {
  width: '100%',
  fontFamily: 'inherit',
  fontSize: '13.5px',
  padding: '9px 12px',
  borderRadius: '8px',
  border: '1.5px solid var(--border-strong)',
  background: '#ffffff',
  color: 'var(--text-main)',
  outline: 'none',
  boxSizing: 'border-box',
};

export const addButtonStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px',
  borderRadius: '10px',
  border: '1.5px dashed var(--primary-border)',
  background: 'var(--primary-subtle)',
  color: 'var(--primary)',
  fontWeight: 700,
  fontSize: '13px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
};
