import type { FC } from 'react';
import { Plus, Trash2, Volume2 } from 'lucide-react';
import type { ExerciseDraft } from '../exerciseDraft';
import { sound } from '../../../utils/audio';
import { type FormProps, speakEnglish, subLabelStyle, fieldInputStyle, addButtonStyle } from './formShared';

export const FlashcardsForm: FC<FormProps> = ({ draft, onChange }) => {
  const { cards } = draft;
  const setCards = (value: ExerciseDraft['cards']) => onChange({ cards: value });

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
          Конструктор карточек со словами (Flashcards 3D)
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
          Создавайте карточки с транскрипцией, контекстом и озвучкой для интервального повторения.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {cards.map((c, idx) => (
          <div
            key={c.id}
            style={{
              background: '#f8fafc',
              border: '1.5px solid var(--border-subtle)',
              borderRadius: '14px',
              padding: '16px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-main)' }}>
                Карточка #{idx + 1}
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => speakEnglish(c.term)}
                  style={{
                    border: 'none',
                    background: '#e0e7ff',
                    color: 'var(--primary)',
                    borderRadius: '8px',
                    padding: '5px 10px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Volume2 size={14} />
                  Озвучить слово
                </button>

                {cards.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setCards(cards.filter((_, i) => i !== idx));
                    }}
                    style={{
                      border: 'none',
                      background: '#fee2e2',
                      color: 'var(--error)',
                      borderRadius: '8px',
                      padding: '5px 8px',
                      cursor: 'pointer',
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1.5fr', gap: '12px' }}>
              <div>
                <label style={subLabelStyle}>Слово (English)</label>
                <input
                  type="text"
                  value={c.term}
                  onChange={(e) => {
                    setCards(cards.map((it, i) => (i === idx ? { ...it, term: e.target.value } : it)));
                  }}
                  placeholder="boarding"
                  style={{ ...fieldInputStyle, fontWeight: 700 }}
                />
              </div>

              <div>
                <label style={subLabelStyle}>Транскрипция IPA</label>
                <input
                  type="text"
                  value={c.transcription}
                  onChange={(e) => {
                    setCards(cards.map((it, i) => (i === idx ? { ...it, transcription: e.target.value } : it)));
                  }}
                  placeholder="/ˈbɔːdɪŋ/"
                  style={fieldInputStyle}
                />
              </div>

              <div>
                <label style={subLabelStyle}>Перевод на русский</label>
                <input
                  type="text"
                  value={c.translation}
                  onChange={(e) => {
                    setCards(cards.map((it, i) => (i === idx ? { ...it, translation: e.target.value } : it)));
                  }}
                  placeholder="посадка на самолет"
                  style={fieldInputStyle}
                />
              </div>
            </div>

            <div>
              <label style={subLabelStyle}>Пример использования в предложении</label>
              <input
                type="text"
                value={c.example}
                onChange={(e) => {
                  setCards(cards.map((it, i) => (i === idx ? { ...it, example: e.target.value } : it)));
                }}
                placeholder="Boarding for flight 204 will commence at gate 12."
                style={fieldInputStyle}
              />
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => {
            sound.playClick();
            setCards([
              ...cards,
              {
                id: `c-${Date.now()}`,
                term: '',
                transcription: '//',
                translation: '',
                example: '',
              },
            ]);
          }}
          style={addButtonStyle}
        >
          <Plus size={16} />
          Добавить карточку слова
        </button>
      </div>
    </div>
  );
};
