import type { Exercise, ExerciseType } from '../../types';
import type { AiExercise } from '../../services/aiSchemas';
import { parseDistractors, seededShuffle, splitWords } from '../../utils/exerciseData';

export interface DraftBlankItem {
  id: string;
  prefixText: string;
  correctAnswer: string;
  hint: string;
  suffixText: string;
}
export interface DraftPair {
  id: string;
  left: string;
  right: string;
}
export interface DraftCard {
  id: string;
  term: string;
  transcription: string;
  translation: string;
  example: string;
}

/** Everything the exercise studio edits, kept in one object so forms stay presentational. */
export interface ExerciseDraft {
  selectedType: ExerciseType;
  title: string;
  instruction: string;
  scoreWeight: number;
  teacherNote: string;

  fillMode: 'visual' | 'text';
  blankItems: DraftBlankItem[];
  blankLinesRaw: string;

  pairs: DraftPair[];

  targetSentence: string;
  hint: string;
  distractors: string;

  cards: DraftCard[];

  quizQuestion: string;
  quizOptions: string[];
  correctOptionIdx: number;
  quizExplanation: string;

  ruleTitle: string;
  ruleContent: string;
  speechAccent: 'en-GB' | 'en-US';
  speechSpeed: number;
  prompts: string[];
}

export const createDefaultDraft = (): ExerciseDraft => ({
  selectedType: 'fill_blanks',
  title: 'Present Simple vs Continuous',
  instruction: 'Fill in the blanks with the correct form of the verb:',
  scoreWeight: 4,
  teacherNote: 'Обратите внимание студента на маркеры времени (usually vs right now).',

  fillMode: 'visual',
  blankItems: [
    { id: 'b1', prefixText: '1. She usually', correctAnswer: 'drinks', hint: 'drink', suffixText: 'coffee, but today she is having tea.' },
    { id: 'b2', prefixText: '2. Look! The train', correctAnswer: 'is arriving', hint: 'arrive', suffixText: 'at platform 3.' },
    { id: 'b3', prefixText: '3. Water', correctAnswer: 'boils', hint: 'boil', suffixText: 'at 100 degrees Celsius.' },
  ],
  blankLinesRaw:
    '1. She usually [drinks] (drink) coffee, but today she [is having] (have) tea.\n2. Look! The train [is arriving] (arrive) at platform 3.\n3. Water [boils] (boil) at 100 degrees Celsius.',

  pairs: [
    { id: '1', left: 'Boarding pass', right: 'Посадочный талон' },
    { id: '2', left: 'Carry-on luggage', right: 'Ручная кладь' },
    { id: '3', left: 'Delay a flight', right: 'Задержать рейс' },
    { id: '4', left: 'Baggage claim', right: 'Выдача багажа' },
  ],

  targetSentence: 'Could you please tell me where the departure gate is?',
  hint: 'Begin with "Could you"',
  distractors: 'did, was',

  cards: [
    { id: '1', term: 'commence', transcription: '/kəˈmens/', translation: 'начинать(ся) официально', example: 'Boarding for flight 204 will commence shortly.' },
    { id: '2', term: 'misplace', transcription: '/ˌmɪsˈpleɪs/', translation: 'положить не туда, потерять', example: 'I seem to have misplaced my boarding pass.' },
    { id: '3', term: 'complimentary', transcription: '/ˌkɒmplɪˈmentri/', translation: 'бесплатный (в качестве бонуса)', example: 'Passengers are offered complimentary drinks during the delay.' },
  ],

  quizQuestion: 'If I _____ more time, I would travel around Scotland.',
  quizOptions: ['had', 'have', 'will have', 'would have'],
  correctOptionIdx: 0,
  quizExplanation: 'Second Conditional uses: If + Past Simple, would + bare infinitive for hypothetical situations.',

  ruleTitle: 'Present Perfect vs Past Simple',
  ruleContent:
    'Use the Present Perfect for life experiences without a specific time:\n• "I have visited London three times."\n\nUse the Past Simple when the exact time is specified or finished:\n• "I visited London in 2024."',
  speechAccent: 'en-GB',
  speechSpeed: 1.0,
  prompts: [
    'Have you ever lost something valuable while travelling?',
    'When was the last time you took an international flight?',
    'What is your favourite city in the world and why?',
  ],
});

/** Build a draft from an existing exercise (edit mode). */
export function draftFromExercise(exercise: Exercise): ExerciseDraft {
  const draft: ExerciseDraft = {
    ...createDefaultDraft(),
    selectedType: exercise.type,
    title: exercise.title,
    instruction: exercise.instruction,
    scoreWeight: exercise.scoreWeight,
    teacherNote: exercise.teacherNote || '',
  };

  switch (exercise.type) {
    case 'fill_blanks': {
      const data = exercise.data as Extract<Exercise['data'], { items: { prefixText: string }[] }>;
      if ('items' in data && Array.isArray(data.items)) {
        draft.blankItems = (data.items as Array<Partial<DraftBlankItem>>).map((it, i) => ({
          id: it.id || `b-${i}`,
          prefixText: it.prefixText || '',
          correctAnswer: it.correctAnswer || '',
          hint: it.hint || '',
          suffixText: it.suffixText || '',
        }));
      }
      break;
    }
    case 'match_pairs': {
      const data = exercise.data;
      if ('pairs' in data) {
        draft.pairs = data.pairs.map((p, i) => ({
          id: p.id || `p-${i}`,
          left: p.leftText || '',
          right: p.rightText || '',
        }));
      }
      break;
    }
    case 'word_order': {
      const data = exercise.data;
      if ('items' in data && 'targetSentence' in (data.items[0] ?? {})) {
        const item = (data.items as { targetSentence: string; hint?: string; distractors?: string[] }[])[0];
        if (item) {
          draft.targetSentence = item.targetSentence || '';
          draft.hint = item.hint || '';
          draft.distractors = item.distractors ? item.distractors.join(', ') : '';
        }
      }
      break;
    }
    case 'flashcards': {
      const data = exercise.data;
      if ('cards' in data) {
        draft.cards = data.cards.map((c, i) => ({
          id: c.id || `c-${i}`,
          term: c.term || '',
          transcription: c.transcription || '',
          translation: c.translation || '',
          example: c.exampleSentence || '',
        }));
      }
      break;
    }
    case 'quiz': {
      const data = exercise.data;
      if ('questions' in data && data.questions[0]) {
        const q = data.questions[0];
        draft.quizQuestion = q.question || '';
        draft.quizOptions = q.options || ['Option 1', 'Option 2', 'Option 3', 'Option 4'];
        draft.correctOptionIdx = q.correctOptionIndex || 0;
        draft.quizExplanation = q.explanation || '';
      }
      break;
    }
    case 'media_rule': {
      const data = exercise.data;
      if ('ruleTitle' in data) {
        draft.ruleTitle = data.ruleTitle || '';
        draft.ruleContent = data.markdownContent || '';
        draft.prompts = data.discussionPrompts || [];
      }
      break;
    }
  }
  return draft;
}

const FILL_LINE = /(.*?)\[(.*?)\](?:\s*\((.*?)\))?(.*)/;

/**
 * Convert a draft into an `Exercise`. Pure and deterministic (ids derive from `exerciseId`),
 * so it is safe to call during render for the live preview.
 */
export function buildExercise(draft: ExerciseDraft, exerciseId: string): Exercise {
  const base = {
    id: exerciseId,
    title: draft.title.trim() || 'Интерактивное задание',
    instruction: draft.instruction.trim() || 'Выполните задание:',
    scoreWeight: draft.scoreWeight,
    teacherNote: draft.teacherNote.trim() || undefined,
  };

  switch (draft.selectedType) {
    case 'fill_blanks': {
      if (draft.fillMode === 'visual') {
        return {
          ...base,
          type: 'fill_blanks',
          data: {
            items: draft.blankItems.map((item, idx) => ({
              id: item.id || `${exerciseId}-b${idx}`,
              prefixText: item.prefixText,
              correctAnswer: item.correctAnswer.trim(),
              hint: item.hint.trim() || undefined,
              suffixText: item.suffixText,
            })),
          },
        };
      }
      const lines = draft.blankLinesRaw.split('\n').filter((l) => l.trim().length > 0);
      return {
        ...base,
        type: 'fill_blanks',
        data: {
          items: lines.map((line, idx) => {
            const match = line.match(FILL_LINE);
            if (match) {
              return {
                id: `${exerciseId}-t${idx}`,
                prefixText: match[1],
                correctAnswer: match[2].trim(),
                hint: match[3]?.trim() || undefined,
                suffixText: match[4] || '',
              };
            }
            return {
              id: `${exerciseId}-t${idx}`,
              prefixText: line,
              correctAnswer: 'answer',
              suffixText: '',
            };
          }),
        },
      };
    }
    case 'match_pairs':
      return {
        ...base,
        type: 'match_pairs',
        data: {
          pairs: draft.pairs.map((p, idx) => ({
            id: p.id || `${exerciseId}-p${idx}`,
            leftText: p.left.trim(),
            rightText: p.right.trim(),
          })),
        },
      };
    case 'word_order': {
      const target = draft.targetSentence.trim();
      const distractorList = parseDistractors(draft.distractors);
      return {
        ...base,
        type: 'word_order',
        data: {
          items: [
            {
              id: `${exerciseId}-w0`,
              targetSentence: target,
              shuffledWords: seededShuffle([...splitWords(target), ...distractorList], target),
              distractors: distractorList.length > 0 ? distractorList : undefined,
              hint: draft.hint.trim() || undefined,
            },
          ],
        },
      };
    }
    case 'flashcards':
      return {
        ...base,
        type: 'flashcards',
        data: {
          cards: draft.cards.map((c, idx) => ({
            id: c.id || `${exerciseId}-c${idx}`,
            term: c.term.trim(),
            transcription: c.transcription.trim(),
            translation: c.translation.trim(),
            exampleSentence: c.example.trim(),
          })),
        },
      };
    case 'quiz':
      return {
        ...base,
        type: 'quiz',
        data: {
          questions: [
            {
              id: `${exerciseId}-q0`,
              question: draft.quizQuestion.trim(),
              options: draft.quizOptions.map((o) => o.trim()),
              correctOptionIndex: draft.correctOptionIdx,
              explanation: draft.quizExplanation.trim() || undefined,
            },
          ],
        },
      };
    case 'media_rule':
      return {
        ...base,
        type: 'media_rule',
        data: {
          ruleTitle: draft.ruleTitle.trim(),
          markdownContent: draft.ruleContent.trim(),
          discussionPrompts: draft.prompts.filter((p) => p.trim().length > 0),
        },
      };
  }
}

/** Merge a validated AI exercise into the draft. */
export function applyAiExercise(draft: ExerciseDraft, ai: AiExercise): ExerciseDraft {
  const next: ExerciseDraft = {
    ...draft,
    selectedType: ai.type,
    title: ai.title,
    instruction: ai.instruction,
    scoreWeight: ai.scoreWeight,
    teacherNote: ai.teacherNote ?? draft.teacherNote,
  };

  switch (ai.type) {
    case 'fill_blanks':
      next.blankItems = ai.data.items.map((it, i) => ({
        id: `b-ai-${i}`,
        prefixText: it.prefixText,
        correctAnswer: it.correctAnswer,
        hint: it.hint ?? '',
        suffixText: it.suffixText,
      }));
      next.fillMode = 'visual';
      break;
    case 'match_pairs':
      next.pairs = ai.data.pairs.map((p, i) => ({ id: `p-ai-${i}`, left: p.leftText, right: p.rightText }));
      break;
    case 'word_order':
      next.targetSentence = ai.data.targetSentence;
      next.hint = ai.data.hint ?? '';
      next.distractors = ai.data.distractors;
      break;
    case 'flashcards':
      next.cards = ai.data.cards.map((c, i) => ({
        id: `fc-ai-${i}`,
        term: c.term,
        transcription: c.transcription || '//',
        translation: c.translation,
        example: c.exampleSentence,
      }));
      break;
    case 'quiz':
      next.quizQuestion = ai.data.question;
      next.quizOptions = ai.data.options;
      next.correctOptionIdx = ai.data.correctOptionIndex;
      next.quizExplanation = ai.data.explanation ?? '';
      break;
    case 'media_rule':
      next.ruleTitle = ai.data.ruleTitle;
      next.ruleContent = ai.data.ruleContent;
      next.prompts = ai.data.discussionPrompts.length > 0 ? ai.data.discussionPrompts : draft.prompts;
      break;
  }
  return next;
}

export const PRESETS: Record<string, Partial<ExerciseDraft>> = {
  airport_dialogue: {
    selectedType: 'fill_blanks',
    title: 'At the Airport: Check-in & Security',
    instruction: 'Fill in the gaps with the correct travel terminology:',
    scoreWeight: 4,
    fillMode: 'visual',
    blankItems: [
      { id: 'p1', prefixText: '1. Good morning. Could I see your passport and', correctAnswer: 'boarding pass', hint: 'pass', suffixText: ', please?' },
      { id: 'p2', prefixText: '2. I would like to request a', correctAnswer: 'window', hint: 'window / aisle', suffixText: 'seat if one is still available.' },
      { id: 'p3', prefixText: '3. Do you have any liquids or a', correctAnswer: 'laptop', hint: 'device', suffixText: 'inside your carry-on luggage?' },
      { id: 'p4', prefixText: '4. Your flight is currently', correctAnswer: 'delayed', hint: 'late', suffixText: 'by approximately 30 minutes.' },
    ],
    teacherNote: 'Focus on polite requests using "Could I..." and pronunciation of "aisle" /aɪl/.',
  },
  business_collocations: {
    selectedType: 'match_pairs',
    title: 'Business English Collocations',
    instruction: 'Match the corporate verbs with their natural noun complements:',
    scoreWeight: 4,
    pairs: [
      { id: '1', left: 'Meet', right: 'Tight deadlines' },
      { id: '2', left: 'Spearhead', right: 'An innovative initiative' },
      { id: '3', left: 'Streamline', right: 'Internal operational processes' },
      { id: '4', left: 'Exceed', right: 'Quarterly sales targets' },
      { id: '5', left: 'Facilitate', right: 'Cross-functional collaboration' },
    ],
    teacherNote: 'Ask the student to create two authentic sentences using their favourite collocations.',
  },
  polite_requests: {
    selectedType: 'word_order',
    title: 'Polite Requests & Indirect Questions',
    instruction: 'Unscramble the words to assemble a natural, polite inquiry:',
    scoreWeight: 3,
    targetSentence: 'Would you mind telling me what time the flight departs?',
    hint: 'Start with "Would you mind"',
    distractors: 'did, was',
    teacherNote: 'Remind the student: "Would you mind" takes a Gerund (V-ing).',
  },
  coffee_ordering: {
    selectedType: 'fill_blanks',
    title: 'Ordering in a London Coffee Shop',
    instruction: 'Complete the customer and barista exchange:',
    scoreWeight: 3,
    fillMode: 'visual',
    blankItems: [
      { id: 'c1', prefixText: '1. Hi there! Could I get a flat white with', correctAnswer: 'oat milk', hint: 'dairy alternative', suffixText: ', please?' },
      { id: 'c2', prefixText: '2. Would you like that to drink here or', correctAnswer: 'take away', hint: 'to go', suffixText: '?' },
      { id: 'c3', prefixText: '3. Can I pay by', correctAnswer: 'contactless card', hint: 'payment method', suffixText: ', or do you only take cash?' },
    ],
    teacherNote: 'Explain the difference between British "take away" and American "to go".',
  },
  phrasal_get: {
    selectedType: 'flashcards',
    title: 'Essential Phrasal Verbs: GET',
    instruction: 'Memorize these four high-frequency phrasal verbs:',
    scoreWeight: 4,
    cards: [
      { id: 'f1', term: 'get along with', transcription: '/ɡet əˈlɒŋ wɪð/', translation: 'ладить с кем-либо, иметь хорошие отношения', example: 'I get along really well with all my new colleagues.' },
      { id: 'f2', term: 'get by', transcription: '/ɡet baɪ/', translation: 'справляться, сводить концы с концами', example: 'My Spanish is not fluent, but I can get by when travelling.' },
      { id: 'f3', term: 'get over', transcription: '/ɡet ˈəʊvə/', translation: 'оправиться, пережить неприятность или болезнь', example: 'It took her several days to get over the jet lag.' },
      { id: 'f4', term: 'get away with', transcription: '/ɡet əˈweɪ wɪð/', translation: 'выйти сухим из воды, избежать наказания', example: 'You cannot get away with arriving late to every board meeting.' },
    ],
    teacherNote: 'Quiz student: which verb means "to have enough money to survive"?',
  },
  conditionals_quiz: {
    selectedType: 'quiz',
    title: 'Conditionals Mastery Test',
    instruction: 'Select the single grammatically correct option:',
    scoreWeight: 5,
    quizQuestion: "She wouldn't have missed the connecting flight if the taxi _____ on time.",
    quizOptions: ['had arrived', 'arrived', 'would arrive', 'has arrived'],
    correctOptionIdx: 0,
    quizExplanation: 'Third Conditional formula: If + Past Perfect (had arrived), would have + Past Participle.',
    teacherNote: 'Ask why "would arrive" is incorrect in the "if" clause.',
  },
  grammar_rule_audio: {
    selectedType: 'media_rule',
    title: 'Present Perfect vs Past Simple',
    instruction: 'Read the rule, listen to natural pronunciation and answer speaking prompts:',
    scoreWeight: 3,
    ruleTitle: 'Life Experiences vs Specific Time',
    ruleContent:
      '**1. Present Perfect (have/has + V3)**\nUsed when the exact time is NOT mentioned, or the period is still continuing:\n• *"I have been to London three times."*\n• *"Have you ever lost your passport?"*\n\n**2. Past Simple (V2 / -ed)**\nUsed when the time is specified or completely finished in the past:\n• *"I visited London last summer."*\n• *"Yesterday, the airline lost my luggage."*',
    prompts: [
      'Have you ever lost something valuable while travelling?',
      'When was the last time you took an international flight?',
      'What is your favourite city in the world and why did you like it?',
    ],
    teacherNote: 'Ensure student answers with Past Simple once they mention a specific past event!',
  },
};
