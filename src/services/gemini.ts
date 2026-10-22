import type {
  ExerciseType,
  CEFRLevel,
  Lesson,
} from '../types';

export const getGeminiApiKey = (): string => {
  if (typeof window !== 'undefined') {
    const customKey = localStorage.getItem('gemini_api_key');
    if (customKey && customKey.trim().length > 0) return customKey.trim();
  }
  return import.meta.env.VITE_GEMINI_API_KEY || '';
};

export const setGeminiApiKey = (key: string): void => {
  if (typeof window !== 'undefined') {
    if (key && key.trim().length > 0) {
      localStorage.setItem('gemini_api_key', key.trim());
    } else {
      localStorage.removeItem('gemini_api_key');
    }
  }
};

/**
 * Call Google Gemini REST API using gemini-3.5-flash-lite (fast, smart, robust for ESL curriculum)
 */
async function callGemini(prompt: string, systemInstruction?: string): Promise<string> {
  const apiKey = getGeminiApiKey();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`;

  const payload: any = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
  };

  if (systemInstruction) {
    payload.systemInstruction = {
      parts: [{ text: systemInstruction }],
    };
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData?.error?.message || `Gemini API error: HTTP ${response.status}`;
    throw new Error(message);
  }

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) {
    throw new Error('Gemini API returned empty response.');
  }

  return rawText;
}

/**
 * Safely parse JSON from model output (strips markdown code fences if present)
 */
function extractJson<T>(raw: string): T {
  let cleaned = raw.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return JSON.parse(cleaned) as T;
}

/**
 * AI Exercise Generator: generates structured exercise content tailored for ESL English lessons
 */
export async function generateExerciseWithGemini(
  type: ExerciseType,
  topic: string,
  level: CEFRLevel = 'B1'
): Promise<{
  title: string;
  instruction: string;
  scoreWeight: number;
  teacherNote: string;
  data: any;
}> {
  const systemPrompt = `You are an expert Cambridge/Oxford-certified ESL teacher creating interactive exercises for English learners.
Target CEFR Level: ${level}.
Return ONLY valid, pure JSON without any markdown formatting, following the requested schema precisely.`;

  let userPrompt = '';

  if (type === 'fill_blanks') {
    userPrompt = `Topic: "${topic}".
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
}`;
  } else if (type === 'match_pairs') {
    userPrompt = `Topic: "${topic}".
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
}`;
  } else if (type === 'word_order') {
    userPrompt = `Topic: "${topic}".
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
}`;
  } else if (type === 'flashcards') {
    userPrompt = `Topic: "${topic}".
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
}`;
  } else if (type === 'quiz') {
    userPrompt = `Topic: "${topic}".
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
}`;
  } else {
    // media_rule
    userPrompt = `Topic: "${topic}".
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
}`;
  }

  const rawResponse = await callGemini(userPrompt, systemPrompt);
  return extractJson(rawResponse);
}

/**
 * AI Full Lesson Generator: generates a complete 4-section lesson ready to conduct
 */
export async function generateFullLessonWithGemini(
  topic: string,
  level: CEFRLevel = 'B1'
): Promise<Lesson> {
  const systemPrompt = `You are a curriculum director at a top-tier English language school.
Design a complete, rich, communicative English lesson for CEFR level ${level}.
Return ONLY valid JSON matching the exact Lesson interface specification. No markdown wrappers.`;

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
  "topic": "${topic}",
  "level": "${level}",
  "description": "...",
  "vocabulary": [
    {
      "id": "v1",
      "term": "...",
      "transcription": "/.../",
      "translation": "...",
      "partOfSpeech": "noun",
      "contextSentence": "..."
    }
  ],
  "sections": [
    {
      "id": "s1",
      "sectionNumber": 1,
      "title": "...",
      "subtitle": "...",
      "exercises": [
        {
          "id": "e1",
          "type": "media_rule",
          "title": "...",
          "instruction": "...",
          "scoreWeight": 3,
          "teacherNote": "...",
          "data": {
            "ruleTitle": "...",
            "markdownContent": "...",
            "discussionPrompts": ["...", "..."]
          }
        }
      ]
    }
  ]
}`;

  const raw = await callGemini(userPrompt, systemPrompt);
  const parsed = extractJson<any>(raw);

  return {
    id: `ai-lesson-${Date.now()}`,
    title: parsed.title || topic,
    unitNumber: Math.floor(Math.random() * 10) + 1,
    level: level,
    topic: topic,
    description: parsed.description || `Interactive ESL lesson on ${topic}`,
    vocabulary: parsed.vocabulary || [],
    sections: (parsed.sections || []).map((s: any, idx: number) => ({
      ...s,
      id: s.id || `s-${Date.now()}-${idx}`,
      sectionNumber: idx + 1,
      exercises: (s.exercises || []).map((ex: any, exIdx: number) => ({
        ...ex,
        id: ex.id || `ex-${Date.now()}-${idx}-${exIdx}`,
      })),
    })),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * AI Teacher In-Class Assistant: answers questions, suggests speaking questions, or explains rules
 */
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
