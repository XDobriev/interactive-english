import { describe, it, expect } from 'vitest';
import type { MatchPairItem } from '../types';

describe('Exercise Validation & Schema Normalization', () => {
  describe('Fill In Blanks normalization', () => {
    it('should correctly validate case-insensitive trimmed answers', () => {
      const correctAnswer = 'departure';
      
      const checkAnswer = (userRaw: string, target: string) => {
        return userRaw.trim().toLowerCase() === target.trim().toLowerCase();
      };

      expect(checkAnswer('departure', correctAnswer)).toBe(true);
      expect(checkAnswer('Departure ', correctAnswer)).toBe(true);
      expect(checkAnswer(' DEPARTURE', correctAnswer)).toBe(true);
      expect(checkAnswer('arrived', correctAnswer)).toBe(false);
    });
  });

  describe('Match Pairs Schema Normalization', () => {
    it('should normalize LLM responses with diverse key variations', () => {
      const rawAiResponse = [
        { left: 'takeaway', right: 'Food to eat outside' },
        { leftText: 'receipt', rightText: 'Proof of payment' },
        { term: 'menu', definition: 'List of dishes' },
        { english: 'bill', russian: 'Счет' },
      ];

      const normalized: MatchPairItem[] = rawAiResponse.map((p: any, idx: number) => ({
        id: p.id || `pair-${idx}`,
        leftText: p.leftText ?? p.left ?? p.term ?? p.english ?? '',
        rightText: p.rightText ?? p.right ?? p.definition ?? p.translation ?? p.russian ?? '',
      }));

      expect(normalized).toHaveLength(4);
      expect(normalized[0].leftText).toBe('takeaway');
      expect(normalized[0].rightText).toBe('Food to eat outside');
      expect(normalized[1].leftText).toBe('receipt');
      expect(normalized[2].leftText).toBe('menu');
      expect(normalized[3].leftText).toBe('bill');
      expect(normalized[3].rightText).toBe('Счет');
    });
  });

  describe('Word Order Sequence Unscrambler', () => {
    it('should verify sentence words assembled in correct sequence', () => {
      const targetSentence = 'Could you please check my baggage?';
      const expectedWords = targetSentence.trim().split(/\s+/);

      const studentCorrectSequence = ['Could', 'you', 'please', 'check', 'my', 'baggage?'];
      const studentIncorrectSequence = ['Could', 'you', 'check', 'please', 'my', 'baggage?'];

      const isSequenceCorrect = (placed: string[], target: string[]) => {
        if (placed.length !== target.length) return false;
        return placed.every((w, idx) => w === target[idx]);
      };

      expect(isSequenceCorrect(studentCorrectSequence, expectedWords)).toBe(true);
      expect(isSequenceCorrect(studentIncorrectSequence, expectedWords)).toBe(false);
    });
  });
});
