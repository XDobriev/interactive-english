import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('syncChannel without a relay (BroadcastChannel)', () => {
  it('delivers messages between listeners on the same channel and never echoes to the sender', async () => {
    const { syncPost, syncSubscribe, isCrossDeviceSync } = await import('../services/syncChannel');
    expect(isCrossDeviceSync()).toBe(false);

    const received: unknown[] = [];
    const off = syncSubscribe('room-1', (d) => received.push(d));
    syncPost('room-1', { hello: 'world' });
    await new Promise((r) => setTimeout(r, 30));
    // BroadcastChannel never delivers to the instance that posted, and `syncPost` uses its own instance
    expect(received).toEqual([{ hello: 'world' }]);

    off();
    syncPost('room-1', { after: 'unsubscribe' });
    await new Promise((r) => setTimeout(r, 30));
    expect(received).toHaveLength(1);
  });

  it('keeps channels isolated', async () => {
    const { syncPost, syncSubscribe } = await import('../services/syncChannel');
    const received: unknown[] = [];
    const off = syncSubscribe('room-a', (d) => received.push(d));
    syncPost('room-b', 'nope');
    await new Promise((r) => setTimeout(r, 30));
    expect(received).toEqual([]);
    off();
  });
});

describe('syncChannel with a relay (WebSocket)', () => {
  class FakeSocket {
    static instances: FakeSocket[] = [];
    static OPEN = 1;
    static CONNECTING = 0;
    readyState = 0;
    sent: string[] = [];
    onopen: (() => void) | null = null;
    onmessage: ((e: { data: string }) => void) | null = null;
    onclose: (() => void) | null = null;
    url: string;
    constructor(url: string) {
      this.url = url;
      FakeSocket.instances.push(this);
    }
    send(data: string) {
      this.sent.push(data);
    }
    close() {
      this.readyState = 3;
      this.onclose?.();
    }
    open() {
      this.readyState = 1;
      this.onopen?.();
    }
  }

  const setup = async () => {
    FakeSocket.instances = [];
    vi.stubGlobal('WebSocket', FakeSocket);
    vi.stubEnv('VITE_SYNC_URL', 'ws://relay.test');
    return import('../services/syncChannel');
  };

  it('joins channels on open, flushes queued messages and routes incoming frames', async () => {
    const { syncPost, syncSubscribe, isCrossDeviceSync } = await setup();
    expect(isCrossDeviceSync()).toBe(true);

    const received: unknown[] = [];
    syncSubscribe('chat-1', (d) => received.push(d));
    syncPost('chat-1', { text: 'queued' });

    const ws = FakeSocket.instances[0];
    expect(ws.url).toBe('ws://relay.test');
    expect(ws.sent).toEqual([]); // not open yet

    ws.open();
    expect(ws.sent.map((m) => JSON.parse(m))).toEqual([
      { type: 'join', channel: 'chat-1' },
      { type: 'msg', channel: 'chat-1', data: { text: 'queued' } },
    ]);

    ws.onmessage?.({ data: JSON.stringify({ channel: 'chat-1', data: { text: 'from peer' } }) });
    ws.onmessage?.({ data: JSON.stringify({ channel: 'other', data: 'ignored' }) });
    ws.onmessage?.({ data: 'garbage' });
    expect(received).toEqual([{ text: 'from peer' }]);
  });

  it('closes the socket when the last listener leaves', async () => {
    const { syncSubscribe } = await setup();
    const off = syncSubscribe('c', () => {});
    const ws = FakeSocket.instances[0];
    ws.open();
    off();
    expect(ws.readyState).toBe(3);
  });
});
