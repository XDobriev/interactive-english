/**
 * Classroom sync transport.
 *
 * - With `VITE_SYNC_URL` set (e.g. ws://localhost:8787, see server/relay.mjs) every message goes through
 *   the WebSocket relay, so teacher and student can be on different devices.
 * - Without it, `BroadcastChannel` is used, which only reaches tabs of the same browser.
 */

type Handler = (data: unknown) => void;

const SYNC_URL: string = import.meta.env.VITE_SYNC_URL ?? '';
const RECONNECT_BASE_MS = 500;
const RECONNECT_MAX_MS = 10_000;

/** Whether messages can reach other devices (as opposed to other tabs only). */
export const isCrossDeviceSync = (): boolean => SYNC_URL.length > 0;

// ---------- WebSocket transport (one shared socket, many channels) ----------

const handlers = new Map<string, Set<Handler>>();
const outbox: string[] = [];
let socket: WebSocket | null = null;
let reconnectDelay = RECONNECT_BASE_MS;
let reconnectTimer: ReturnType<typeof setTimeout> | undefined;

function connect(): void {
  if (socket && socket.readyState <= WebSocket.OPEN) return;
  const ws = new WebSocket(SYNC_URL);
  socket = ws;

  ws.onopen = () => {
    reconnectDelay = RECONNECT_BASE_MS;
    for (const channel of handlers.keys()) {
      ws.send(JSON.stringify({ type: 'join', channel }));
    }
    while (outbox.length > 0) ws.send(outbox.shift() as string);
  };

  ws.onmessage = (event) => {
    try {
      const { channel, data } = JSON.parse(String(event.data)) as { channel: string; data: unknown };
      handlers.get(channel)?.forEach((handler) => handler(data));
    } catch {
      // ignore malformed frames
    }
  };

  ws.onclose = () => {
    if (socket === ws) socket = null;
    if (handlers.size === 0) return;
    clearTimeout(reconnectTimer);
    reconnectTimer = setTimeout(connect, reconnectDelay);
    reconnectDelay = Math.min(reconnectDelay * 2, RECONNECT_MAX_MS);
  };
}

function wsSend(frame: object): void {
  const text = JSON.stringify(frame);
  connect();
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(text);
  } else {
    outbox.push(text);
    if (outbox.length > 100) outbox.shift();
  }
}

function wsSubscribe(channel: string, handler: Handler): () => void {
  let set = handlers.get(channel);
  if (!set) {
    set = new Set();
    handlers.set(channel, set);
  }
  set.add(handler);
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type: 'join', channel }));
  } else {
    connect();
  }

  return () => {
    set.delete(handler);
    if (set.size === 0) handlers.delete(channel);
    if (handlers.size === 0 && socket) {
      clearTimeout(reconnectTimer);
      const closing = socket;
      socket = null;
      closing.close();
    }
  };
}

// ---------- Public API ----------

/** Send a message to everyone else listening on `channel`. */
export function syncPost(channel: string, data: unknown): void {
  if (SYNC_URL) {
    wsSend({ type: 'msg', channel, data });
    return;
  }
  if (typeof BroadcastChannel === 'undefined') return;
  try {
    const bc = new BroadcastChannel(channel);
    bc.postMessage(data);
    bc.close();
  } catch {
    // ignore in sandboxed contexts
  }
}

/** Listen on `channel`; returns an unsubscribe function. Own messages are never echoed back. */
export function syncSubscribe<T>(channel: string, handler: (data: T) => void): () => void {
  const wrapped: Handler = (data) => handler(data as T);
  if (SYNC_URL) {
    return wsSubscribe(channel, wrapped);
  }
  if (typeof BroadcastChannel === 'undefined') return () => {};
  const bc = new BroadcastChannel(channel);
  bc.onmessage = (event) => wrapped(event.data);
  return () => bc.close();
}
