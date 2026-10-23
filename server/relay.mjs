/**
 * Minimal WebSocket relay for classroom sync (chat, timer, whiteboard, lesson state).
 * Clients join named channels and every message is forwarded to the other members of that channel.
 * Nothing is stored: late joiners only see messages sent after they joined.
 *
 *   npm run relay            # PORT=8787 by default
 *   ALLOWED_ORIGINS=https://xdobriev.github.io npm run relay
 */
import { WebSocketServer } from 'ws';

const PORT = Number(process.env.PORT) || 8787;
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '').split(',').map((o) => o.trim()).filter(Boolean);
const MAX_PAYLOAD_BYTES = 64 * 1024;
const MAX_CHANNELS_PER_SOCKET = 20;
const CHANNEL_NAME = /^[\w:.-]{1,100}$/;

/** @type {Map<string, Set<import('ws').WebSocket>>} */
const channels = new Map();

const wss = new WebSocketServer({
  port: PORT,
  maxPayload: MAX_PAYLOAD_BYTES,
  verifyClient: ({ origin }) => ALLOWED_ORIGINS.length === 0 || ALLOWED_ORIGINS.includes(origin),
});

wss.on('connection', (socket) => {
  /** @type {Set<string>} */
  const joined = new Set();
  socket.isAlive = true;
  socket.on('pong', () => {
    socket.isAlive = true;
  });

  socket.on('message', (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      return;
    }
    if (typeof msg !== 'object' || msg === null || typeof msg.channel !== 'string' || !CHANNEL_NAME.test(msg.channel)) {
      return;
    }

    if (msg.type === 'join') {
      if (joined.size >= MAX_CHANNELS_PER_SOCKET && !joined.has(msg.channel)) return;
      joined.add(msg.channel);
      if (!channels.has(msg.channel)) channels.set(msg.channel, new Set());
      channels.get(msg.channel).add(socket);
    } else if (msg.type === 'msg' && joined.has(msg.channel)) {
      const payload = JSON.stringify({ channel: msg.channel, data: msg.data });
      for (const peer of channels.get(msg.channel) ?? []) {
        if (peer !== socket && peer.readyState === peer.OPEN) peer.send(payload);
      }
    }
  });

  socket.on('close', () => {
    for (const name of joined) {
      const members = channels.get(name);
      members?.delete(socket);
      if (members?.size === 0) channels.delete(name);
    }
  });
});

// Drop dead connections
const heartbeat = setInterval(() => {
  for (const socket of wss.clients) {
    if (!socket.isAlive) {
      socket.terminate();
      continue;
    }
    socket.isAlive = false;
    socket.ping();
  }
}, 30_000);
wss.on('close', () => clearInterval(heartbeat));

console.log(`Sync relay listening on ws://localhost:${PORT}`);
