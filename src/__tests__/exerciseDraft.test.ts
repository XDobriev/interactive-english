import { describe, expect, it } from 'vitest';
import {
  PRESETS,
  buildExercise,
  createDefaultDraft,
  draftFromExercise,
  type ExerciseDraft,
} from '../components/builder/exerciseDraft';
import type { QuizData, WordOrderData } from '../types';

const draftOf = (patch: Partial<ExerciseDraft>): ExerciseDraft => ({ ...createDefaultDraft(), ...patch });

describe('buildExercise', () => {
  it('is deterministic so the live preview does not reshuffle or change ids', () => {
    const draft = draftOf({ selectedType: 'word_order' });
    expect(buildExercise(draft, 'ex-1')).toEqual(buildExercise(draft, 'ex-1'));
  });

  it('builds word order with distractors mixed into the shuffled words', () => {
    const exercise = buildExercise(
      draftOf({ selectedType: 'word_order', targetSentence: 'I like tea', distractors: 'did, was' }),
      'ex-1'
    );
    const [item] = (exercise.data as WordOrderData).items;
    expect([...item.shuffledWords].sort()).toEqual(['I', 'did', 'like', 'tea', 'was']);
    expect(item.distractors).toEqual(['did', 'was']);
  });

  it('parses the quick-text syntax for fill in blanks', () => {
    const exercise = buildExercise(
      draftOf({ selectedType: 'fill_blanks', fillMode: 'text', blankLinesRaw: 'Water [boils] (boil) at 100.\nplain line' }),
      'ex-1'
    );
    const items = (exercise.data as { items: { correctAnswer: string; hint?: string; prefixText: string }[] }).items;
    expect(items[0]).toMatchObject({ prefixText: 'Water ', correctAnswer: 'boils', hint: 'boil' });
    expect(items[1].correctAnswer).toBe('answer');
  });

  it('falls back to default title and instruction', () => {
    const exercise = buildExercise(draftOf({ title: '  ', instruction: '' }), 'ex-1');
    expect(exercise.title).toBe('Интерактивное задание');
    expect(exercise.instruction).toBe('Выполните задание:');
  });
});

describe('draftFromExercise', () => {
  it('round-trips a quiz exercise', () => {
    const original = buildExercise(
      draftOf({ selectedType: 'quiz', quizQuestion: 'Q?', quizOptions: ['a', 'b', 'c'], correctOptionIdx: 2 }),
      'ex-1'
    );
    const draft = draftFromExercise(original);
    expect(draft.quizOptions).toEqual(['a', 'b', 'c']);
    expect(draft.correctOptionIdx).toBe(2);
    expect((buildExercise(draft, 'ex-1').data as QuizData).questions[0].question).toBe('Q?');
  });
});

describe('PRESETS', () => {
  it('every preset produces a buildable exercise of its own type', () => {
    for (const [key, preset] of Object.entries(PRESETS)) {
      const exercise = buildExercise(draftOf(preset), `preset-${key}`);
      expect(exercise.type).toBe(preset.selectedType);
      expect(exercise.title.length).toBeGreaterThan(0);
    }
  });
});
