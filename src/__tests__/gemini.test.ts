import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  MAX_PROMPT_LENGTH,
  askAITeacherAssistant,
  callGemini,
  extractJson,
  generateExerciseWithGemini,
  generateFullLessonWithGemini,
} from '../services/gemini';

const okResponse = (text: string) => new Response(JSON.stringify({ text }), { status: 200 });

const mockFetchSequence = (...responses: Response[]) => {
  const fetchMock = vi.fn();
  responses.forEach((r) => fetchMock.mockResolvedValueOnce(r));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('extractJson', () => {
  it('parses plain JSON', () => {
    expect(extractJson('{"a":1}')).toEqual({ a: 1 });
  });

  it('strips ```json fences', () => {
    expect(extractJson('```json\n{"a":1}\n```')).toEqual({ a: 1 });
  });

  it('strips bare ``` fences', () => {
    expect(extractJson('```\n[1,2]\n```')).toEqual([1, 2]);
  });

  it('throws on malformed JSON', () => {
    expect(() => extractJson('not json')).toThrow();
  });
});

describe('callGemini', () => {
  it('posts to the proxy and returns text, never sending an API key', async () => {
    const fetchMock = mockFetchSequence(okResponse('hello'));
    await expect(callGemini('hi', 'be brief')).resolves.toBe('hello');

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/gemini');
    expect(JSON.parse(init.body)).toEqual({ prompt: 'hi', systemInstruction: 'be brief' });
    expect(String(url)).not.toContain('key=');
  });

  it('surfaces the server error message', async () => {
    mockFetchSequence(new Response(JSON.stringify({ error: 'quota exceeded' }), { status: 502 }));
    await expect(callGemini('hi')).rejects.toThrow('quota exceeded');
  });

  it('falls back to a status message when the body is not JSON', async () => {
    mockFetchSequence(new Response('boom', { status: 500 }));
    await expect(callGemini('hi')).rejects.toThrow('HTTP 500');
  });

  it('rejects an empty response', async () => {
    mockFetchSequence(new Response(JSON.stringify({}), { status: 200 }));
    await expect(callGemini('hi')).rejects.toThrow('empty');
  });

  it('rejects over-long prompts without calling the network', async () => {
    const fetchMock = mockFetchSequence();
    await expect(callGemini('x'.repeat(MAX_PROMPT_LENGTH + 1))).rejects.toThrow('слишком длинный');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('reports network failures in Russian', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    await expect(callGemini('hi')).rejects.toThrow('Не удалось связаться');
  });
});

describe('generateExerciseWithGemini', () => {
  const quiz = {
    title: 'Quiz',
    instruction: 'Pick one',
    scoreWeight: 4,
    teacherNote: 'note',
    data: { question: 'If I ___ time', options: ['had', 'have'], correctOptionIndex: 0, explanation: 'why' },
  };

  it('returns a validated exercise', async () => {
    mockFetchSequence(okResponse('```json\n' + JSON.stringify(quiz) + '\n```'));
    const result = await generateExerciseWithGemini('quiz', 'conditionals', 'B1');
    expect(result.type).toBe('quiz');
    if (result.type === 'quiz') expect(result.data.options).toEqual(['had', 'have']);
  });

  it('retries once when the first answer does not match the schema', async () => {
    const fetchMock = mockFetchSequence(okResponse('{"title":"x"}'), okResponse(JSON.stringify(quiz)));
    const result = await generateExerciseWithGemini('quiz', 'conditionals');
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result.title).toBe('Quiz');
  });

  it('fails with a friendly error after two invalid answers', async () => {
    mockFetchSequence(okResponse('garbage'), okResponse('{"data":{}}'));
    await expect(generateExerciseWithGemini('quiz', 'conditionals')).rejects.toThrow('неверном формате');
  });

  it('rejects a quiz whose correct index is out of range', async () => {
    const bad = { ...quiz, data: { ...quiz.data, correctOptionIndex: 5 } };
    mockFetchSequence(okResponse(JSON.stringify(bad)), okResponse(JSON.stringify(bad)));
    await expect(generateExerciseWithGemini('quiz', 'x')).rejects.toThrow('неверном формате');
  });

  it('accepts alternative pair keys and array distractors', async () => {
    const pairs = {
      title: 'Pairs',
      instruction: 'Match',
      scoreWeight: 4,
      data: { pairs: [{ left: 'bill', right: 'счёт' }] },
    };
    mockFetchSequence(okResponse(JSON.stringify(pairs)));
    const result = await generateExerciseWithGemini('match_pairs', 'restaurant');
    if (result.type === 'match_pairs') expect(result.data.pairs[0]).toEqual({ leftText: 'bill', rightText: 'счёт' });
  });
});

describe('generateFullLessonWithGemini', () => {
  const lesson = {
    title: 'Travel',
    description: 'desc',
    vocabulary: [{ term: 'luggage', translation: 'багаж' }],
    sections: [
      {
        title: 'Warm-up',
        subtitle: 'sub',
        exercises: [
          {
            type: 'media_rule',
            title: 'Rule',
            instruction: 'Read',
            scoreWeight: 3,
            data: { ruleTitle: 'PP', markdownContent: 'text', discussionPrompts: ['q1'] },
          },
          { type: 'quiz', title: 'broken', instruction: 'x', scoreWeight: 3, data: { nonsense: true } },
        ],
      },
    ],
  };

  it('builds a canonical lesson and drops invalid exercises', async () => {
    mockFetchSequence(okResponse(JSON.stringify(lesson)));
    const result = await generateFullLessonWithGemini('travel', 'B2');

    expect(result.level).toBe('B2');
    expect(result.sections).toHaveLength(1);
    const [exercise] = result.sections[0].exercises;
    expect(result.sections[0].exercises).toHaveLength(1);
    expect(exercise.type).toBe('media_rule');
    expect(exercise.data).toMatchObject({ ruleTitle: 'PP', markdownContent: 'text' });
    expect(result.vocabulary[0].id).toBeTruthy();
  });
});

describe('askAITeacherAssistant', () => {
  it('includes lesson context in the prompt', async () => {
    const fetchMock = mockFetchSequence(okResponse('answer'));
    await expect(askAITeacherAssistant('Explain it', { lessonTitle: 'Travel', level: 'B1' })).resolves.toBe('answer');
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.prompt).toContain('Travel');
    expect(body.prompt).toContain('Explain it');
  });
});
