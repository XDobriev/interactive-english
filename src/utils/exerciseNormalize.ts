import type {
  FlashcardItem,
  MatchPairItem,
  QuizQuestion,
  WordOrderItem,
} from '../types';
import { seededShuffle, splitWords } from './exerciseData';

/**
 * Defensive normalizers for exercise payloads. Lessons can come from the builder, the seed
 * curriculum, older saved data or an LLM, so field names vary; these turn any of them
 * into the canonical shapes the exercise components render.
 */

type Rec = Record<string, unknown>;

const isRec = (value: unknown): value is Rec =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** First string/number among the candidates (like `??`, but typed). */
const pick = (...values: unknown[]): string | undefined => {
  for (const v of values) {
    if (typeof v === 'string') return v;
    if (typeof v === 'number') return String(v);
  }
  return undefined;
};

const str = (...values: unknown[]): string => pick(...values) ?? '';

/** Items array found directly in `data`, under one of `keys`, or `data` itself when it is a single item. */
function listOf(data: unknown, keys: string[], singleItemKey?: string): Rec[] {
  if (Array.isArray(data)) return data.filter(isRec);
  if (!isRec(data)) return [];
  for (const key of keys) {
    const candidate = data[key];
    if (Array.isArray(candidate)) return candidate.filter(isRec);
  }
  if (singleItemKey && data[singleItemKey]) return [data];
  return [];
}

export function normalizeMatchPairs(data: unknown): MatchPairItem[] {
  return listOf(data, ['pairs']).map((p, idx) => ({
    id: str(p.id) || `pair-${idx}`,
    leftText: str(p.leftText, p.left, p.term, p.english),
    rightText: str(p.rightText, p.right, p.definition, p.translation, p.russian),
  }));
}

export function normalizeFlashcards(data: unknown): FlashcardItem[] {
  return listOf(data, ['cards']).map((c, i) => ({
    id: str(c.id) || `card-${i}`,
    term: str(c.term, c.word),
    transcription: pick(c.transcription) ?? '//',
    translation: str(c.translation),
    definitionEn: str(c.definitionEn),
    exampleSentence: str(c.exampleSentence, c.example),
  }));
}

export function normalizeQuiz(data: unknown): QuizQuestion[] {
  return listOf(data, ['questions'], 'question').map((q, i) => ({
    id: str(q.id) || `q-${i}`,
    question: str(q.question),
    options: Array.isArray(q.options) ? q.options.map((o) => str(o)) : ['Option A', 'Option B'],
    correctOptionIndex: typeof q.correctOptionIndex === 'number' ? q.correctOptionIndex : 0,
    explanation: str(q.explanation) || undefined,
  }));
}

export function normalizeWordOrder(data: unknown): WordOrderItem[] {
  return listOf(data, ['items'], 'targetSentence').map((it, idx) => {
    const id = str(it.id) || `wo-${idx}`;
    const targetSentence = str(it.targetSentence, it.sentence);
    const given = Array.isArray(it.shuffledWords) ? it.shuffledWords.map((w) => str(w)) : [];
    const shuffledWords =
      given.length > 0 ? given : seededShuffle(splitWords(targetSentence), `${id}:${targetSentence}`);
    return {
      id,
      targetSentence,
      shuffledWords,
      hint: str(it.hint) || undefined,
      distractors: Array.isArray(it.distractors) ? it.distractors.map((d) => str(d)) : undefined,
    };
  });
}

export interface NormalizedBlankItem {
  id: string;
  prefixText: string;
  correctAnswer: string;
  hint?: string;
  suffixText: string;
}

export function normalizeFillBlanks(data: unknown): NormalizedBlankItem[] {
  return listOf(data, ['items', 'sentences', 'blanks']).map((item, idx) => {
    const sentence = pick(item.sentence);
    return {
      id: str(item.id) || `fib-${idx}`,
      prefixText: str(item.prefixText, item.textBefore, sentence?.split(/\[.*?\]/)[0]),
      correctAnswer: str(
        item.correctAnswer,
        item.answer,
        item.word,
        sentence?.match(/\[(.*?)\]/)?.[1]
      ),
      hint: str(item.hint) || undefined,
      suffixText: str(item.suffixText, item.textAfter, sentence?.split(/\[.*?\]/)[1]),
    };
  });
}
