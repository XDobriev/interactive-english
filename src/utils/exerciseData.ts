import type { Exercise } from '../types';
import type { AiExercise } from '../services/aiSchemas';

/** Deterministic string hash (FNV-1a) used to seed shuffles so previews stay stable between renders. */
export function hashString(value: string): number {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Seeded Fisher–Yates shuffle (mulberry32); the same input and seed always give the same order. */
export function seededShuffle<T>(items: readonly T[], seed: string): T[] {
  const result = [...items];
  let state = hashString(seed);
  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function splitWords(sentence: string): string[] {
  return sentence.trim().split(/\s+/).filter((w) => w.length > 0);
}

export function parseDistractors(raw: string): string[] {
  return raw
    .split(',')
    .map((d) => d.trim())
    .filter((d) => d.length > 0);
}

/** Convert a validated AI exercise into the canonical `Exercise` stored in lessons. */
export function aiExerciseToExercise(ai: AiExercise, id: string): Exercise {
  const base = {
    id,
    type: ai.type,
    title: ai.title,
    instruction: ai.instruction,
    scoreWeight: ai.scoreWeight,
    teacherNote: ai.teacherNote,
  };

  switch (ai.type) {
    case 'fill_blanks':
      return {
        ...base,
        type: ai.type,
        data: { items: ai.data.items.map((it, i) => ({ ...it, id: `${id}-b${i}` })) },
      };
    case 'match_pairs':
      return {
        ...base,
        type: ai.type,
        data: { pairs: ai.data.pairs.map((p, i) => ({ ...p, id: `${id}-p${i}` })) },
      };
    case 'word_order': {
      const distractors = parseDistractors(ai.data.distractors);
      return {
        ...base,
        type: ai.type,
        data: {
          items: [
            {
              id: `${id}-w0`,
              targetSentence: ai.data.targetSentence,
              shuffledWords: seededShuffle([...splitWords(ai.data.targetSentence), ...distractors], id),
              distractors: distractors.length > 0 ? distractors : undefined,
              hint: ai.data.hint,
            },
          ],
        },
      };
    }
    case 'flashcards':
      return {
        ...base,
        type: ai.type,
        data: { cards: ai.data.cards.map((c, i) => ({ ...c, id: `${id}-c${i}` })) },
      };
    case 'quiz':
      return {
        ...base,
        type: ai.type,
        data: { questions: [{ ...ai.data, id: `${id}-q0` }] },
      };
    case 'media_rule':
      return {
        ...base,
        type: ai.type,
        data: {
          ruleTitle: ai.data.ruleTitle,
          markdownContent: ai.data.ruleContent,
          discussionPrompts: ai.data.discussionPrompts,
        },
      };
  }
}
