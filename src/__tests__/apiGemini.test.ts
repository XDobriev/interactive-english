import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import handler from '../../api/gemini';

const post = (body: unknown, headers: Record<string, string> = {}) =>
  new Request('http://localhost/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });

const upstreamOk = (text: string) =>
  new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text }] } }] }), { status: 200 });

beforeEach(() => {
  vi.stubEnv('GEMINI_API_KEY', 'secret-key');
  vi.stubEnv('ALLOWED_ORIGINS', '');
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('api/gemini', () => {
  it('forwards the prompt with the key in a header, not in the URL', async () => {
    const fetchMock = vi.fn().mockResolvedValue(upstreamOk('hi'));
    vi.stubGlobal('fetch', fetchMock);

    const res = await handler(post({ prompt: 'hello', systemInstruction: 'sys' }));
    expect(await res.json()).toEqual({ text: 'hi' });

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).not.toContain('secret-key');
    expect(init.headers['x-goog-api-key']).toBe('secret-key');
    expect(JSON.parse(init.body).systemInstruction.parts[0].text).toBe('sys');
  });

  it('fails clearly when the server key is missing', async () => {
    vi.stubEnv('GEMINI_API_KEY', '');
    const res = await handler(post({ prompt: 'x' }));
    expect(res.status).toBe(500);
  });

  it('validates the request body', async () => {
    expect((await handler(post('not json'))).status).toBe(400);
    expect((await handler(post({}))).status).toBe(400);
    expect((await handler(post({ prompt: 'x'.repeat(8001) }))).status).toBe(413);
  });

  it('rejects non-POST methods', async () => {
    const res = await handler(new Request('http://localhost/api/gemini', { method: 'GET' }));
    expect(res.status).toBe(405);
  });

  it('maps upstream errors to 502 with the message', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: { message: 'quota' } }), { status: 429 }))
    );
    const res = await handler(post({ prompt: 'x' }));
    expect(res.status).toBe(502);
    expect((await res.json()).error).toBe('quota');
  });

  it('only sends CORS headers for allow-listed origins', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(upstreamOk('ok')));
    vi.stubEnv('ALLOWED_ORIGINS', 'https://good.example');

    const allowed = await handler(post({ prompt: 'x' }, { origin: 'https://good.example' }));
    expect(allowed.headers.get('Access-Control-Allow-Origin')).toBe('https://good.example');

    const denied = await handler(post({ prompt: 'x' }, { origin: 'https://evil.example' }));
    expect(denied.headers.get('Access-Control-Allow-Origin')).toBeNull();
  });
});
