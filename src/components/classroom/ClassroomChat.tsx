import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, X, ShieldAlert, Sparkles } from 'lucide-react';
import type { ChatMessage, UserRole } from '../../types';
import { syncPost, syncSubscribe } from '../../services/syncChannel';
import { sound } from '../../utils/audio';

interface ClassroomChatProps {
  lessonId: string;
  role: UserRole;
  userName: string;
  onClose: () => void;
}

export const ClassroomChat: React.FC<ClassroomChatProps> = ({
  lessonId,
  role,
  userName,
  onClose,
}) => {
  const storageKey = `chat_messages_${lessonId}`;

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return [
      {
        id: 'welcome-msg',
        senderRole: 'teacher',
        senderName: 'Преподаватель',
        text: 'Добро пожаловать на урок! Здесь можно писать вопросы или заметки.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  const [inputText, setInputText] = useState('');
  const [isCorrectionMode, setIsCorrectionMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync messages with other tabs/devices
  useEffect(
    () =>
      syncSubscribe<{ type: string; messages: ChatMessage[] }>(`chat-sync-${lessonId}`, (data) => {
        if (data.type === 'NEW_MESSAGE') setMessages(data.messages);
      }),
    [lessonId]
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const broadcastMessages = (updated: ChatMessage[]) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch {}

    syncPost(`chat-sync-${lessonId}`, { type: 'NEW_MESSAGE', messages: updated });
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    sound.playClick();

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderRole: role,
      senderName: userName,
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isCorrection: role === 'teacher' && isCorrectionMode,
    };

    const updated = [...messages, newMsg];
    setMessages(updated);
    broadcastMessages(updated);
    setInputText('');
    setIsCorrectionMode(false);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '64px',
        right: '20px',
        bottom: '20px',
        width: '360px',
        background: 'var(--surface-white)',
        border: '1.5px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-float)',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--surface-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '15px' }}>
          <MessageSquare size={18} color="var(--primary)" />
          <span>Чат занятия</span>
        </div>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)', padding: '4px' }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Messages Feed */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        {messages.map((msg) => {
          const isMe = msg.senderRole === role;

          return (
            <div
              key={msg.id}
              style={{
                alignSelf: isMe ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--text-light)',
                  marginBottom: '3px',
                  textAlign: isMe ? 'right' : 'left',
                }}
              >
                {msg.senderName} • {msg.timestamp}
              </div>

              <div
                style={{
                  background: msg.isCorrection
                    ? '#fef3c7'
                    : isMe
                    ? 'var(--primary)'
                    : 'var(--surface-subtle)',
                  color: msg.isCorrection
                    ? '#92400e'
                    : isMe
                    ? '#ffffff'
                    : 'var(--text-main)',
                  border: msg.isCorrection
                    ? '1.5px solid #fde68a'
                    : isMe
                    ? 'none'
                    : '1px solid var(--border-subtle)',
                  borderRadius: isMe ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                  padding: '10px 14px',
                  fontSize: '13.5px',
                  lineHeight: 1.45,
                  wordBreak: 'break-word',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}
              >
                {msg.isCorrection && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>
                    <ShieldAlert size={13} />
                    Исправление учителя:
                  </div>
                )}
                {msg.text}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border-subtle)', background: 'var(--surface-white)' }}>
        {role === 'teacher' && (
          <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              onClick={() => setIsCorrectionMode(!isCorrectionMode)}
              style={{
                background: isCorrectionMode ? '#fef3c7' : 'none',
                border: isCorrectionMode ? '1px solid #fde68a' : '1px solid var(--border-subtle)',
                color: isCorrectionMode ? '#92400e' : 'var(--text-muted)',
                borderRadius: '12px',
                padding: '3px 10px',
                fontSize: '11.5px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Sparkles size={12} />
              {isCorrectionMode ? '✓ Режим исправления речи' : '+ Выделить как исправление'}
            </button>
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
            placeholder={isCorrectionMode ? 'Введите правильный вариант фразы...' : 'Напишите сообщение...'}
            style={{
              flex: 1,
              padding: '9px 14px',
              borderRadius: '20px',
              border: '1.5px solid var(--border-subtle)',
              fontSize: '13.5px',
              outline: 'none',
            }}
          />
          <button
            className="btn btn-primary"
            style={{ borderRadius: '50%', width: '38px', height: '38px', padding: 0, justifyContent: 'center' }}
            onClick={handleSendMessage}
            disabled={!inputText.trim()}
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};
