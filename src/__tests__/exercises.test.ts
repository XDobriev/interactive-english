import { describe, it, expect } from 'vitest';
import {
  normalizeFillBlanks,
  normalizeFlashcards,
  normalizeMatchPairs,
  normalizeQuiz,
  normalizeWordOrder,
} from '../utils/exerciseNormalize';
import { seededShuffle } from '../utils/exerciseData';

describe('normalizeMatchPairs', () => {
  it('accepts diverse key variations produced by LLMs', () => {
    const pairs = normalizeMatchPairs({
      pairs: [
        { left: 'takeaway', right: 'Food to eat outside' },
        { leftText: 'receipt', rightText: 'Proof of payment' },
        { term: 'menu', definition: 'List of dishes' },
        { english: 'bill', russian: 'Счет' },
      ],
    });

    expect(pairs).toHaveLength(4);
    expect(pairs.map((p) => p.leftText)).toEqual(['takeaway', 'receipt', 'menu', 'bill']);
    expect(pairs[0].rightText).toBe('Food to eat outside');
    expect(pairs[3].rightText).toBe('Счет');
    expect(pairs[0].id).toBe('pair-0');
  });

  it('returns an empty list for unusable data', () => {
    expect(normalizeMatchPairs(undefined)).toEqual([]);
    expect(normalizeMatchPairs({ pairs: 'nope' })).toEqual([]);
  });
});

describe('normalizeFillBlanks', () => {
  it('keeps canonical items', () => {
    const [item] = normalizeFillBlanks({
      items: [{ id: 'a', prefixText: '1. She ', correctAnswer: 'drinks', hint: 'drink', suffixText: ' tea.' }],
    });
    expect(item).toEqual({ id: 'a', prefixText: '1. She ', correctAnswer: 'drinks', hint: 'drink', suffixText: ' tea.' });
  });

  it('parses bracketed sentences', () => {
    const [item] = normalizeFillBlanks({ sentences: [{ sentence: 'Water [boils] at 100 degrees.' }] });
    expect(item.prefixText).toBe('Water ');
    expect(item.correctAnswer).toBe('boils');
    expect(item.suffixText).toBe(' at 100 degrees.');
  });
});

describe('normalizeQuiz', () => {
  it('wraps a flat question and fills defaults', () => {
    const [q] = normalizeQuiz({ question: 'If I ___ more time', options: ['had', 'have'], correctOptionIndex: 1 });
    expect(q.question).toBe('If I ___ more time');
    expect(q.correctOptionIndex).toBe(1);
    expect(q.id).toBe('q-0');
  });

  it('defaults missing options and index', () => {
    const [q] = normalizeQuiz({ questions: [{ question: 'Q' }] });
    expect(q.options).toHaveLength(2);
    expect(q.correctOptionIndex).toBe(0);
  });
});

describe('normalizeFlashcards', () => {
  it('maps alternative field names', () => {
    const [card] = normalizeFlashcards({ cards: [{ word: 'commence', example: 'It will commence.' }] });
    expect(card.term).toBe('commence');
    expect(card.exampleSentence).toBe('It will commence.');
    expect(card.transcription).toBe('//');
  });
});

describe('normalizeWordOrder', () => {
  it('shuffles the target sentence deterministically when no words are given', () => {
    const data = { targetSentence: 'Could you please check my baggage?' };
    const first = normalizeWordOrder(data)[0];
    const second = normalizeWordOrder(data)[0];

    expect(first.shuffledWords).toEqual(second.shuffledWords);
    expect([...first.shuffledWords].sort()).toEqual(first.targetSentence.split(' ').sort());
  });

  it('keeps provided shuffled words (including distractors)', () => {
    const [item] = normalizeWordOrder({
      items: [{ id: 'w', targetSentence: 'A b', shuffledWords: ['b', 'x', 'A'] }],
    });
    expect(item.shuffledWords).toEqual(['b', 'x', 'A']);
  });
});

describe('seededShuffle', () => {
  it('is a stable permutation', () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8];
    const a = seededShuffle(input, 'seed');
    expect(seededShuffle(input, 'seed')).toEqual(a);
    expect([...a].sort()).toEqual(input);
    expect(input).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });
});
