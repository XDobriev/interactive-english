import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X, StickyNote, Sparkles } from 'lucide-react';
import type { WhiteboardNote } from '../../types';
import { syncPost, syncSubscribe } from '../../services/syncChannel';
import { sound } from '../../utils/audio';

interface ClassroomWhiteboardProps {
  lessonId: string;
  isTeacher: boolean;
  onClose: () => void;
}

const NOTE_COLORS = [
  { id: 'yellow', bg: '#fef08a', border: '#fde047', text: '#713f12' },
  { id: 'blue', bg: '#bae6fd', border: '#7dd3fc', text: '#0c4a6e' },
  { id: 'green', bg: '#bbf7d0', border: '#86efac', text: '#14532d' },
  { id: 'pink', bg: '#fbcfe8', border: '#f472b6', text: '#831843' },
  { id: 'purple', bg: '#e9d5ff', border: '#c084fc', text: '#581c87' },
] as const;

export const ClassroomWhiteboard: React.FC<ClassroomWhiteboardProps> = ({
  lessonId,
  isTeacher,
  onClose,
}) => {
  const storageKey = `whiteboard_notes_${lessonId}`;
  
  const [notes, setNotes] = useState<WhiteboardNote[]>(() => {
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
        id: 'default-note-1',
        color: 'yellow',
        title: 'Заметки к уроку',
        text: 'Пишите сюда новые фразы, исправления произношения и полезные идиомы во время разговора.',
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  const [newNoteText, setNewNoteText] = useState('');
  const [selectedColor, setSelectedColor] = useState<'yellow' | 'blue' | 'green' | 'pink' | 'purple'>('yellow');

  // Sync notes with other tabs/devices
  useEffect(
    () =>
      syncSubscribe<{ type: string; notes: WhiteboardNote[] }>(`whiteboard-sync-${lessonId}`, (data) => {
        if (data.type === 'SYNC_NOTES') setNotes(data.notes);
      }),
    [lessonId]
  );

  const broadcastNotes = (updated: WhiteboardNote[]) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch {}

    syncPost(`whiteboard-sync-${lessonId}`, { type: 'SYNC_NOTES', notes: updated });
  };

  const handleAddNote = () => {
    if (!newNoteText.trim()) return;
    sound.playClick();
    const newNote: WhiteboardNote = {
      id: `note-${Date.now()}`,
      color: selectedColor,
      text: newNoteText.trim(),
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    const updated = [newNote, ...notes];
    setNotes(updated);
    broadcastNotes(updated);
    setNewNoteText('');
  };

  const handleDeleteNote = (id: string) => {
    sound.playClick();
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
    broadcastNotes(updated);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '64px',
        right: '20px',
        bottom: '20px',
        width: '380px',
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
      {/* Drawer Header */}
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
          <StickyNote size={18} color="var(--primary)" />
          <span>Интерактивная доска</span>
          <span
            style={{
              fontSize: '11px',
              padding: '2px 8px',
              borderRadius: '12px',
              background: 'var(--primary-subtle)',
              color: 'var(--primary)',
              fontWeight: 700,
            }}
          >
            Live
          </span>
        </div>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)', padding: '4px' }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Teacher Add Note Box */}
      {isTeacher && (
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--surface-white)' }}>
          <textarea
            value={newNoteText}
            onChange={(e) => setNewNoteText(e.target.value)}
            placeholder="Напишите пояснение, фразу или исправление..."
            style={{
              width: '100%',
              minHeight: '70px',
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              border: '1.5px solid var(--border-subtle)',
              fontFamily: 'inherit',
              fontSize: '13.5px',
              resize: 'none',
              marginBottom: '10px',
              boxSizing: 'border-box',
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                handleAddNote();
              }
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              {NOTE_COLORS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedColor(c.id)}
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: c.bg,
                    border: selectedColor === c.id ? `2px solid ${c.text}` : `1px solid ${c.border}`,
                    cursor: 'pointer',
                    transform: selectedColor === c.id ? 'scale(1.2)' : 'scale(1)',
                    transition: 'transform 0.15s ease',
                  }}
                  title={c.id}
                />
              ))}
            </div>

            <button
              className="btn btn-primary"
              style={{ padding: '6px 14px', fontSize: '13px' }}
              onClick={handleAddNote}
              disabled={!newNoteText.trim()}
            >
              <Plus size={14} />
              Прикрепить стикер
            </button>
          </div>
        </div>
      )}

      {/* Notes Stream */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {notes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 10px', color: 'var(--text-light)', fontSize: '13.5px' }}>
            <Sparkles size={28} style={{ margin: '0 auto 10px', display: 'block', opacity: 0.5 }} />
            Доска пуста. Добавьте заметку или исправление во время урока.
          </div>
        ) : (
          notes.map((note) => {
            const colorCfg = NOTE_COLORS.find((c) => c.id === note.color) || NOTE_COLORS[0];

            return (
              <div
                key={note.id}
                style={{
                  background: colorCfg.bg,
                  border: `1.5px solid ${colorCfg.border}`,
                  borderRadius: '12px',
                  padding: '14px 16px',
                  color: colorCfg.text,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                  position: 'relative',
                  transform: 'rotate(-0.5deg)',
                }}
              >
                {note.title && (
                  <div style={{ fontWeight: 800, fontSize: '13px', marginBottom: '4px' }}>
                    {note.title}
                  </div>
                )}
                <div style={{ fontSize: '14px', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                  {note.text}
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '10px',
                    fontSize: '11px',
                    opacity: 0.7,
                  }}
                >
                  <span>{note.createdAt}</span>
                  {isTeacher && (
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: colorCfg.text,
                        padding: 0,
                        opacity: 0.8,
                      }}
                      title="Удалить стикер"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
