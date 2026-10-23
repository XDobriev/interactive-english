import type { ExerciseType, CEFRLevel, Lesson, LessonSection } from '../types';
import {
  aiLessonSchema,
  parseAiExercise,
  parseAiLessonExercise,
  type AiExercise,
} from './aiSchemas';
import { aiExerciseToExercise } from '../utils/exerciseData';

/** Base URL of the backend that hosts `/api/gemini` (empty = same origin). */
const API_BASE: string = import.meta.env.VITE_API_BASE ?? '';
const REQUEST_TIMEOUT_MS = 30_000;
export const MAX_PROMPT_LENGTH = 8000;

/**
 * Call the Gemini proxy. The API key lives only on the server (see api/gemini.ts),
 * so it is never shipped to the browser.
 */
export async function callGemini(prompt: string, systemInstruction?: string): Promise<string> {
  if (prompt.length > MAX_PROMPT_LENGTH) {
    throw new Error(`Запрос слишком длинный (максимум ${MAX_PROMPT_LENGTH} символов).`);
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE}/api/gemini`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, systemInstruction }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (err) {
    if (err instanceof DOMException && (err.name === 'TimeoutError' || err.name === 'AbortError')) {
      throw new Error('Gemini не ответил вовремя. Попробуйте ещё раз.');
    }
    throw new Error('Не удалось связаться с сервером Gemini. Проверьте подключение.');
  }

  if (!response.ok) {
    const errorData: { error?: string } = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Gemini API error: HTTP ${response.status}`);
  }

  const data: { text?: string } = await response.json();
  if (!data.text) {
    throw new Error('Gemini API returned empty response.');
  }
  return data.text;
}

/** Parse JSON from model output, stripping markdown code fences if present. */
export function extractJson(raw: string): unknown {
  let cleaned = raw.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
  }
  return JSON.parse(cleaned);
}

/** Run a model call + validation, retrying once if the output is malformed. */
async function generateValidated<T>(
  prompt: string,
  systemInstruction: string,
  parse: (raw: unknown) => T
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    const raw = await callGemini(prompt, systemInstruction);
    try {
      return parse(extractJson(raw));
    } catch (err) {
      lastError = err;
    }
  }
  console.warn('Gemini returned invalid output twice:', lastError);
  throw new Error('Gemini вернул ответ в неверном формате. Попробуйте изменить тему или повторить запрос.');
}

const EXERCISE_PROMPTS: Record<ExerciseType, (topic: string) => string> = {
  fill_blanks: (topic) => `Topic: "${topic}".
Create an interactive fill-in-the-blanks exercise (3 to 4 sentences).
Return a JSON object with this exact shape:
{
  "title": "Exercise title in English",
  "instruction": "Instructions for student in English",
  "scoreWeight": 4,
  "teacherNote": "Brief pedagogical note in Russian on common errors to look out for",
  "data": {
    "items": [
      {
        "prefixText": "Sentence text before gap, e.g. '1. She usually '",
        "correctAnswer": "correct word to fill, e.g. 'drinks'",
        "hint": "base word or hint in brackets, e.g. 'drink'",
        "suffixText": "Sentence text after gap, e.g. ' coffee in the morning.'"
      }
    ]
  }
}`,
  match_pairs: (topic) => `Topic: "${topic}".
Create a match pairs vocabulary or collocation exercise (4 to 5 pairs).
Return a JSON object with this exact shape:
{
  "title": "Exercise title in English",
  "instruction": "Match the words on the left with their Russian translations / equivalents:",
  "scoreWeight": 4,
  "teacherNote": "Pedagogical tip in Russian for the teacher",
  "data": {
    "pairs": [
      {
        "leftText": "English word or collocation",
        "rightText": "Russian translation or definition"
      }
    ]
  }
}`,
  word_order: (topic) => `Topic: "${topic}".
Create a sentence unscramble / word order exercise.
Return a JSON object with this exact shape:
{
  "title": "Exercise title in English",
  "instruction": "Unscramble the words to assemble a natural English sentence:",
  "scoreWeight": 3,
  "teacherNote": "Pedagogical advice in Russian",
  "data": {
    "targetSentence": "Full correct English sentence, e.g. 'Could you please tell me where the baggage claim is?'",
    "hint": "Hint starting word, e.g. 'Start with Could you'",
    "distractors": "two extra distractor words separated by comma, e.g. 'did, was'"
  }
}`,
  flashcards: (topic) => `Topic: "${topic}".
Create 3 to 4 high-yield ESL flashcards.
Return a JSON object with this exact shape:
{
  "title": "Vocabulary Flashcards: ${topic}",
  "instruction": "Review and memorize the vocabulary cards:",
  "scoreWeight": 4,
  "teacherNote": "Tip in Russian on how to elicit active use",
  "data": {
    "cards": [
      {
        "term": "English word or phrasal verb",
        "transcription": "/IPA transcription/",
        "translation": "Перевод на русский",
        "exampleSentence": "Natural example sentence demonstrating clear context."
      }
    ]
  }
}`,
  quiz: (topic) => `Topic: "${topic}".
Create a multiple choice grammar or vocabulary question.
Return a JSON object with this exact shape:
{
  "title": "Quiz: ${topic}",
  "instruction": "Select the single correct grammatical option:",
  "scoreWeight": 4,
  "teacherNote": "Why students often confuse these options in Russian",
  "data": {
    "question": "Question sentence with a blank or prompt, e.g. 'If I _____ more time, I would travel more.'",
    "options": ["had", "have", "will have", "would have"],
    "correctOptionIndex": 0,
    "explanation": "Clear grammatical explanation of why this answer is correct."
  }
}`,
  media_rule: (topic) => `Topic: "${topic}".
Create an ESL grammar rule explanation with speaking discussion prompts.
Return a JSON object with this exact shape:
{
  "title": "Grammar & Speaking: ${topic}",
  "instruction": "Study the rule, listen to pronunciation, and discuss questions with your teacher:",
  "scoreWeight": 3,
  "teacherNote": "Focus areas for speaking in Russian",
  "data": {
    "ruleTitle": "Rule Title in English",
    "ruleContent": "Clear rule explanation formatted with bullet points and realistic examples",
    "discussionPrompts": [
      "Open-ended question 1 for speaking practice",
      "Open-ended question 2 for speaking practice",
      "Open-ended question 3 for speaking practice"
    ]
  }
}`,
};

/** AI Exercise Generator: returns a schema-validated exercise for the given type. */
export async function generateExerciseWithGemini(
  type: ExerciseType,
  topic: string,
  level: CEFRLevel = 'B1'
): Promise<AiExercise> {
  const systemPrompt = `You are an expert Cambridge/Oxford-certified ESL teacher creating interactive exercises for English learners.
Target CEFR Level: ${level}.
Return ONLY valid, pure JSON without any markdown formatting, following the requested schema precisely.`;

  return generateValidated(EXERCISE_PROMPTS[type](topic), systemPrompt, (raw) => parseAiExercise(type, raw));
}

/** AI Full Lesson Generator: generates a complete multi-section lesson ready to conduct. */
export async function generateFullLessonWithGemini(
  topic: string,
  level: CEFRLevel = 'B1'
): Promise<Lesson> {
  const systemPrompt = `You are a curriculum director at a top-tier English language school.
Design a complete, rich, communicative English lesson for CEFR level ${level}.
Return ONLY valid JSON matching the requested format. No markdown wrappers.`;

  const userPrompt = `Create a complete interactive lesson on topic: "${topic}" for level ${level}.
Requirements:
- 1 title (e.g. "Travel Dilemmas & Lost Baggage")
- Description of goals and communicative outcomes
- 4 vocabulary words with term, transcription, translation, partOfSpeech, contextSentence
- 3 sections:
  1. "Warm-up & Discussion" with a 'media_rule' exercise (discussion prompts).
  2. "Vocabulary & Practice" with a 'match_pairs' exercise and a 'fill_blanks' exercise.
  3. "Grammar & Production" with a 'quiz' or 'word_order' exercise.

JSON format:
{
  "title": "...",
  "description": "...",
  "vocabulary": [
    { "term": "...", "transcription": "/.../", "translation": "...", "partOfSpeech": "noun", "contextSentence": "..." }
  ],
  "sections": [
    {
      "title": "...",
      "subtitle": "...",
      "exercises": [
        {
          "type": "media_rule | match_pairs | fill_blanks | quiz | word_order",
          "title": "...",
          "instruction": "...",
          "scoreWeight": 3,
          "teacherNote": "... (in Russian)",
          "data": "exactly the 'data' object of that exercise type:
            media_rule: { ruleTitle, ruleContent, discussionPrompts: [..] }
            match_pairs: { pairs: [{ leftText, rightText }] }
            fill_blanks: { items: [{ prefixText, correctAnswer, hint, suffixText }] }
            quiz: { question, options: [..], correctOptionIndex, explanation }
            word_order: { targetSentence, hint, distractors }"
        }
      ]
    }
  ]
}`;

  const parsed = await generateValidated(userPrompt, systemPrompt, (raw) => {
    const lesson = aiLessonSchema.parse(raw);
    const sections = lesson.sections
      .map((s) => ({
        ...s,
        exercises: s.exercises.map(parseAiLessonExercise).filter((e): e is AiExercise => e !== null),
      }))
      .filter((s) => s.exercises.length > 0);
    if (sections.length === 0) throw new Error('No valid exercises in AI lesson');
    return { ...lesson, sections };
  });

  const stamp = Date.now();
  const now = new Date().toISOString();
  const sections: LessonSection[] = parsed.sections.map((s, idx) => ({
    id: `s-${stamp}-${idx}`,
    sectionNumber: idx + 1,
    title: s.title,
    subtitle: s.subtitle,
    exercises: s.exercises.map((ex, exIdx) => aiExerciseToExercise(ex, `ex-${stamp}-${idx}-${exIdx}`)),
  }));

  return {
    id: `ai-lesson-${stamp}`,
    title: parsed.title || topic,
    unitNumber: Math.floor(Math.random() * 10) + 1,
    level,
    topic,
    description: parsed.description || `Interactive ESL lesson on ${topic}`,
    vocabulary: parsed.vocabulary.map((v, i) => ({ ...v, id: v.id || `v-${stamp}-${i}` })),
    sections,
    createdAt: now,
    updatedAt: now,
  };
}

/** AI Teacher In-Class Assistant: answers questions, suggests speaking questions, or explains rules. */
export async function askAITeacherAssistant(
  question: string,
  context?: { lessonTitle?: string; currentTopic?: string; level?: string }
): Promise<string> {
  const systemPrompt = `You are an expert AI co-teacher helping an English tutor during a live lesson.
Answer concisely, practically, and in Russian (with English examples).
Give actionable suggestions, error explanations, or conversation starters immediately.`;

  const contextStr = context
    ? `Context: Lesson "${context.lessonTitle || ''}", Topic: "${context.currentTopic || ''}", Level: ${context.level || 'B1'}.\n`
    : '';

  return callGemini(`${contextStr}Teacher's question: ${question}`, systemPrompt);
}
