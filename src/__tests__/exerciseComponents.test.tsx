import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { QuizExercise } from '../components/exercises/QuizExercise';
import { FillInBlanksExercise } from '../components/exercises/FillInBlanksExercise';
import { MatchPairsExercise } from '../components/exercises/MatchPairsExercise';
import type { FillBlanksData, MatchPairsData, QuizData } from '../types';

vi.mock('../utils/audio', () => ({
  sound: {
    playClick: vi.fn(),
    playCorrect: vi.fn(),
    playIncorrect: vi.fn(),
    playTimerDing: vi.fn(),
  },
}));

afterEach(cleanup);

const quizData: QuizData = {
  questions: [{ id: 'q1', question: 'Pick', options: ['wrong', 'right'], correctOptionIndex: 1 }],
};

describe('QuizExercise', () => {
  it('renders options and accepts an answer', () => {
    render(<QuizExercise data={quizData} />);
    fireEvent.click(screen.getByText('right'));
    expect(screen.getByText('right')).toBeInTheDocument();
  });

  it('resets answers when the question changes (no stale state)', () => {
    const { rerender } = render(<QuizExercise data={quizData} />);
    fireEvent.click(screen.getByText('wrong'));
    rerender(
      <QuizExercise
        data={{ questions: [{ id: 'q2', question: 'Another', options: ['x', 'y'], correctOptionIndex: 0 }] }}
      />
    );
    expect(screen.getByText('Another')).toBeInTheDocument();
    expect(screen.queryByText(/Объяснение|Правильно|Неверно/)).toBeNull();
  });
});

describe('FillInBlanksExercise', () => {
  const data: FillBlanksData = {
    items: [{ id: 'b1', prefixText: 'She ', correctAnswer: 'Drinks', suffixText: ' tea.' }],
  };

  it('prefills correct answers when showAnswers is on', () => {
    render(<FillInBlanksExercise data={data} showAnswers />);
    expect(screen.getByDisplayValue('Drinks')).toBeInTheDocument();
  });

  it('starts empty otherwise', () => {
    render(<FillInBlanksExercise data={data} />);
    expect(screen.queryByDisplayValue('Drinks')).toBeNull();
  });
});

describe('MatchPairsExercise', () => {
  const data: MatchPairsData = {
    pairs: [
      { id: 'a', leftText: 'bill', rightText: 'счёт' },
      { id: 'b', leftText: 'menu', rightText: 'меню' },
    ],
  };

  it('shows every term on both sides', () => {
    render(<MatchPairsExercise data={data} />);
    expect(screen.getByText('bill')).toBeInTheDocument();
    expect(screen.getByText('счёт')).toBeInTheDocument();
    expect(screen.getByText(/Соединено: 0 из 2/)).toBeInTheDocument();
  });

  it('counts a correct match', () => {
    render(<MatchPairsExercise data={data} />);
    fireEvent.click(screen.getByText('bill'));
    fireEvent.click(screen.getByText('счёт'));
    expect(screen.getByText(/Соединено: 1 из 2/)).toBeInTheDocument();
  });
});
