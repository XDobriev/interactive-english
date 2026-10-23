import { z } from 'zod';
import type { ExerciseType } from '../types';

const text = z.string().trim();

const exerciseBase = {
  title: text.min(1),
  instruction: text.min(1),
  scoreWeight: z.coerce.number().int().min(1).max(10).catch(3),
  teacherNote: text.optional(),
};

const fillBlanksData = z.object({
  items: z
    .array(
      z.object({
        prefixText: z.string().default(''),
        correctAnswer: text.min(1),
        hint: text.optional(),
        suffixText: z.string().default(''),
      })
    )
    .min(1),
});

const matchPairsData = z.object({
  pairs: z
    .array(
      z
        .object({
          leftText: text.optional(),
          left: text.optional(),
          rightText: text.optional(),
          right: text.optional(),
        })
        .transform((p) => ({
          leftText: p.leftText ?? p.left ?? '',
          rightText: p.rightText ?? p.right ?? '',
        }))
        .refine((p) => p.leftText.length > 0 && p.rightText.length > 0)
    )
    .min(1),
});

const wordOrderData = z.object({
  targetSentence: text.min(1),
  hint: text.optional(),
  distractors: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((d) => (Array.isArray(d) ? d.join(', ') : (d ?? ''))),
});

const flashcardsData = z.object({
  cards: z
    .array(
      z
        .object({
          term: text.min(1),
          transcription: z.string().default(''),
          translation: z.string().default(''),
          exampleSentence: z.string().optional(),
          example: z.string().optional(),
        })
        .transform(({ example, exampleSentence, ...rest }) => ({
          ...rest,
          exampleSentence: exampleSentence ?? example ?? '',
        }))
    )
    .min(1),
});

const quizData = z
  .object({
    question: text.min(1),
    options: z.array(text.min(1)).min(2).max(6),
    correctOptionIndex: z.coerce.number().int().min(0),
    explanation: text.optional(),
  })
  .refine((q) => q.correctOptionIndex < q.options.length, {
    message: 'correctOptionIndex out of range',
  });

const mediaRuleData = z
  .object({
    ruleTitle: text.min(1),
    ruleContent: z.string().optional(),
    markdownContent: z.string().optional(),
    discussionPrompts: z.array(text.min(1)).optional(),
  })
  .transform(({ ruleContent, markdownContent, ...rest }) => ({
    ...rest,
    ruleContent: ruleContent ?? markdownContent ?? '',
    discussionPrompts: rest.discussionPrompts ?? [],
  }));

export const exerciseDataSchemas = {
  fill_blanks: fillBlanksData,
  match_pairs: matchPairsData,
  word_order: wordOrderData,
  flashcards: flashcardsData,
  quiz: quizData,
  media_rule: mediaRuleData,
} as const;

export type AiFillBlanksData = z.infer<typeof fillBlanksData>;
export type AiMatchPairsData = z.infer<typeof matchPairsData>;
export type AiWordOrderData = z.infer<typeof wordOrderData>;
export type AiFlashcardsData = z.infer<typeof flashcardsData>;
export type AiQuizData = z.infer<typeof quizData>;
export type AiMediaRuleData = z.infer<typeof mediaRuleData>;

type Base = { title: string; instruction: string; scoreWeight: number; teacherNote?: string };

/** Validated AI-generated exercise, discriminated by `type`. */
export type AiExercise = Base &
  (
    | { type: 'fill_blanks'; data: AiFillBlanksData }
    | { type: 'match_pairs'; data: AiMatchPairsData }
    | { type: 'word_order'; data: AiWordOrderData }
    | { type: 'flashcards'; data: AiFlashcardsData }
    | { type: 'quiz'; data: AiQuizData }
    | { type: 'media_rule'; data: AiMediaRuleData }
  );

const envelope = z.object({ ...exerciseBase, data: z.unknown() });

/** Validate a raw exercise object returned by the model for the given type. */
export function parseAiExercise(type: ExerciseType, raw: unknown): AiExercise {
  const env = envelope.parse(raw);
  const data = exerciseDataSchemas[type].parse(env.data);
  return { ...env, type, data } as AiExercise;
}

const vocabWord = z.object({
  id: z.string().optional(),
  term: text.min(1),
  transcription: z.string().default(''),
  translation: z.string().default(''),
  partOfSpeech: z.string().default(''),
  contextSentence: z.string().optional(),
});

const exerciseType = z.enum(['fill_blanks', 'match_pairs', 'word_order', 'flashcards', 'quiz', 'media_rule']);

const lessonExercise = z.object({ ...exerciseBase, type: exerciseType, data: z.unknown() });

export const aiLessonSchema = z.object({
  title: text.min(1).optional(),
  description: z.string().optional(),
  vocabulary: z.array(vocabWord).default([]),
  sections: z
    .array(
      z.object({
        title: text.min(1),
        subtitle: z.string().default(''),
        exercises: z.array(z.unknown()).default([]),
      })
    )
    .min(1),
});

export type AiLesson = z.infer<typeof aiLessonSchema>;

/** Validate one exercise of an AI lesson; returns null if it does not match its type's schema. */
export function parseAiLessonExercise(raw: unknown): AiExercise | null {
  const env = lessonExercise.safeParse(raw);
  if (!env.success) return null;
  try {
    return parseAiExercise(env.data.type, env.data);
  } catch {
    return null;
  }
}
