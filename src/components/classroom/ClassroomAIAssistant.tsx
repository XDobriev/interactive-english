import React, { useState } from 'react';
import { Sparkles, X, Send, Loader2, Copy, Check, MessageSquare, Lightbulb, HelpCircle } from 'lucide-react';
import { askAITeacherAssistant } from '../../services/gemini';
import { sound } from '../../utils/audio';

interface ClassroomAIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  lessonTitle: string;
  topic: string;
  level: string;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export const ClassroomAIAssistant: React.FC<ClassroomAIAssistantProps> = ({
  isOpen,
  onClose,
  lessonTitle,
  topic,
  level,
}) => {
  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: 'm-welcome',
      sender: 'ai',
      text: `Здравствуйте! Я ваш ИИ-ассистент по уроку «${lessonTitle}» (${level}). Могу подсказать, как объяснить сложное правило, предложить дополнительные вопросы для Speaking или разобрать ошибку ученика.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputText;
    if (!textToSend.trim() || isLoading) return;

    sound.playClick();
    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setInputText('');
    setIsLoading(true);

    try {
      const response = await askAITeacherAssistant(textToSend.trim(), {
        lessonTitle,
        currentTopic: topic,
        level,
      });

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
      sound.playCorrect();
    } catch (err) {
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        sender: 'ai',
        text: `⚠️ Ошибка: ${err instanceof Error && err.message ? err.message : 'Не удалось связаться с Gemini API.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
      sound.playIncorrect();
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        width: '420px',
        maxHeight: '600px',
        height: '75vh',
        background: '#ffffff',
        borderRadius: '18px',
        boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.25)',
        border: '1.5px solid #c7d2fe',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 250,
        overflow: 'hidden',
        animation: 'fadeIn 0.2s ease-out',
      }}
    >
      {/* Top Header */}
      <div
        style={{
          padding: '14px 18px',
          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={18} />
          <div>
            <div style={{ fontSize: '14px', fontWeight: 800 }}>Gemini AI Ассистент</div>
            <div style={{ fontSize: '11px', opacity: 0.85 }}>Урок: {level} • {topic}</div>
          </div>
        </div>

        <button
          onClick={onClose}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: '#ffffff',
            borderRadius: '50%',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Quick Prompts Chips */}
      <div
        style={{
          padding: '10px 14px',
          background: '#f8fafc',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          gap: '6px',
          overflowX: 'auto',
          whiteSpace: 'nowrap',
        }}
      >
        <button
          onClick={() => handleSend(`Объясни грамматическую тему «${topic}» для ученика уровня ${level} максимально просто, с 2 живыми примерами.`)}
          style={chipStyle}
        >
          <Lightbulb size={12} />
          Объясни правило
        </button>
        <button
          onClick={() => handleSend(`Придумай 3 интересных вопроса для разговорной практики (Speaking) по теме «${topic}» для уровня ${level}.`)}
          style={chipStyle}
        >
          <MessageSquare size={12} />
          3 вопроса Speaking
        </button>
        <button
          onClick={() => handleSend(`Приведи 2 примера диалога из реальной жизни по теме «${topic}».`)}
          style={chipStyle}
        >
          <HelpCircle size={12} />
          Примеры диалога
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          background: '#f1f5f9',
        }}
      >
        {messages.map((m) => {
          const isAi = m.sender === 'ai';
          return (
            <div
              key={m.id}
              style={{
                alignSelf: isAi ? 'flex-start' : 'flex-end',
                maxWidth: '88%',
                background: isAi ? '#ffffff' : 'var(--primary)',
                color: isAi ? 'var(--text-main)' : '#ffffff',
                padding: '12px 14px',
                borderRadius: isAi ? '14px 14px 14px 2px' : '14px 14px 2px 14px',
                boxShadow: 'var(--shadow-subtle)',
                fontSize: '13px',
                lineHeight: 1.5,
                position: 'relative',
              }}
            >
              <div style={{ whiteSpace: 'pre-wrap' }}>{m.text}</div>
              
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '6px',
                  fontSize: '10.5px',
                  opacity: 0.7,
                }}
              >
                <span>{m.timestamp}</span>
                {isAi && (
                  <button
                    onClick={() => handleCopy(m.id, m.text)}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      color: 'var(--primary)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px',
                      padding: 0,
                    }}
                  >
                    {copiedId === m.id ? <Check size={12} /> : <Copy size={12} />}
                    {copiedId === m.id ? 'Скопировано' : 'Копировать'}
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div
            style={{
              alignSelf: 'flex-start',
              background: '#ffffff',
              padding: '10px 14px',
              borderRadius: '14px 14px 14px 2px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '13px',
              color: 'var(--primary)',
              fontWeight: 600,
            }}
          >
            <Loader2 size={16} className="spin-animate" />
            Gemini думает...
          </div>
        )}
      </div>

      {/* Input Area */}
      <div
        style={{
          padding: '12px 14px',
          background: '#ffffff',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
        }}
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend();
          }}
          placeholder="Спросить Gemini об уроке, ошибке..."
          style={{
            flex: 1,
            fontFamily: 'inherit',
            fontSize: '13px',
            padding: '9px 12px',
            borderRadius: '10px',
            border: '1.5px solid var(--border-strong)',
            outline: 'none',
          }}
        />

        <button
          onClick={() => handleSend()}
          disabled={!inputText.trim() || isLoading}
          style={{
            border: 'none',
            background: !inputText.trim() || isLoading ? '#cbd5e1' : 'var(--primary)',
            color: '#ffffff',
            borderRadius: '10px',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: !inputText.trim() || isLoading ? 'default' : 'pointer',
            flexShrink: 0,
            transition: 'background 0.15s ease',
          }}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
};

const chipStyle: React.CSSProperties = {
  border: '1px solid #c7d2fe',
  background: '#eef2ff',
  color: 'var(--primary)',
  borderRadius: '8px',
  padding: '4px 10px',
  fontSize: '11.5px',
  fontWeight: 700,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  flexShrink: 0,
};
