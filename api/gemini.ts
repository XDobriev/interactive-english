/**
 * Server-side Gemini proxy (Vercel Function / Web-standard handler).
 * The API key is read from GEMINI_API_KEY and never reaches the browser.
 */
const DEFAULT_MODEL = 'gemini-3.5-flash-lite';
const MAX_PROMPT_LENGTH = 8000;
const MAX_SYSTEM_LENGTH = 4000;
const UPSTREAM_TIMEOUT_MS = 25_000;

interface GeminiRequestBody {
  prompt?: unknown;
  systemInstruction?: unknown;
}

interface GeminiUpstreamResponse {
  candidates?: { content?: { parts?: { text?: string }[] } }[];
  error?: { message?: string };
}

const json = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export async function POST(request: Request): Promise<Response> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return json({ error: 'На сервере не настроен GEMINI_API_KEY.' }, 500);
  }

  let body: GeminiRequestBody;
  try {
    body = (await request.json()) as GeminiRequestBody;
  } catch {
    return json({ error: 'Некорректный JSON в запросе.' }, 400);
  }

  const { prompt, systemInstruction } = body;
  if (typeof prompt !== 'string' || prompt.trim().length === 0) {
    return json({ error: 'Поле prompt обязательно.' }, 400);
  }
  if (prompt.length > MAX_PROMPT_LENGTH) {
    return json({ error: `Запрос слишком длинный (максимум ${MAX_PROMPT_LENGTH} символов).` }, 413);
  }
  if (
    systemInstruction !== undefined &&
    (typeof systemInstruction !== 'string' || systemInstruction.length > MAX_SYSTEM_LENGTH)
  ) {
    return json({ error: 'Некорректное поле systemInstruction.' }, 400);
  }

  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const payload: Record<string, unknown> = { contents: [{ parts: [{ text: prompt }] }] };
  if (typeof systemInstruction === 'string' && systemInstruction.length > 0) {
    payload.systemInstruction = { parts: [{ text: systemInstruction }] };
  }

  let upstream: Response;
  try {
    upstream = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
      }
    );
  } catch {
    return json({ error: 'Gemini не ответил вовремя.' }, 504);
  }

  const data = (await upstream.json().catch(() => ({}))) as GeminiUpstreamResponse;
  if (!upstream.ok) {
    return json({ error: data.error?.message || `Gemini API error: HTTP ${upstream.status}` }, 502);
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    return json({ error: 'Gemini вернул пустой ответ.' }, 502);
  }
  return json({ text });
}

/**
 * Cross-origin callers (e.g. the GitHub Pages build calling a Vercel deployment) must be listed in
 * ALLOWED_ORIGINS (comma-separated). Without it only same-origin requests work.
 */
function corsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('origin');
  const allowed = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  if (!origin || !allowed.includes(origin)) return {};
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
  };
}

export default async function handler(request: Request): Promise<Response> {
  const cors = corsHeaders(request);
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors });
  }
  const response = request.method === 'POST' ? await POST(request) : json({ error: 'Method not allowed' }, 405);
  Object.entries(cors).forEach(([name, value]) => response.headers.set(name, value));
  return response;
}
