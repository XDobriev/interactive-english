import type { FC } from 'react';
import { Plus, Trash2, Volume2, Sparkles } from 'lucide-react';
import type { ExerciseDraft } from '../exerciseDraft';
import { sound } from '../../../utils/audio';
import { type FormProps, speakEnglish, subLabelStyle, fieldInputStyle, addButtonStyle } from './formShared';

export const FillBlanksForm: FC<FormProps> = ({ draft, onChange }) => {
  const { fillMode, blankItems, blankLinesRaw } = draft;
  const setFillMode = (value: 'visual' | 'text') => onChange({ fillMode: value });
  const setBlankItems = (value: ExerciseDraft['blankItems']) => onChange({ blankItems: value });
  const setBlankLinesRaw = (value: string) => onChange({ blankLinesRaw: value });
  const handleAddExample = () => {
    sound.playClick();
    setBlankLinesRaw(blankLinesRaw + '\n4. I would like to [order] (verb) a sandwich.');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            Конструктор пропусков в тексте
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
            Создайте предложения с интерактивными полями ввода или выбора для ученика.
          </p>
        </div>

        {/* Visual vs Raw text mode toggle */}
        <div style={{ display: 'flex', background: '#f1f5f9', padding: '3px', borderRadius: '10px' }}>
          <button
            onClick={() => setFillMode('visual')}
            style={{
              padding: '5px 12px',
              borderRadius: '8px',
              border: 'none',
              background: fillMode === 'visual' ? '#ffffff' : 'transparent',
              color: fillMode === 'visual' ? 'var(--primary)' : 'var(--text-muted)',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Визуальные карточки
          </button>
          <button
            onClick={() => setFillMode('text')}
            style={{
              padding: '5px 12px',
              borderRadius: '8px',
              border: 'none',
              background: fillMode === 'text' ? '#ffffff' : 'transparent',
              color: fillMode === 'text' ? 'var(--primary)' : 'var(--text-muted)',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Быстрый текст
          </button>
        </div>
      </div>

      {fillMode === 'visual' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {blankItems.map((item, idx) => (
            <div
              key={item.id}
              style={{
                background: '#f8fafc',
                border: '1.5px solid var(--border-subtle)',
                borderRadius: '14px',
                padding: '16px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                transition: 'border-color 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      background: 'var(--primary-subtle)',
                      color: 'var(--primary)',
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 800,
                    }}
                  >
                    {idx + 1}
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>
                    Предложение с пропуском
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {/* Audio pronounce button */}
                  <button
                    type="button"
                    onClick={() => {
                      const fullText = `${item.prefixText} ${item.correctAnswer} ${item.suffixText}`;
                      speakEnglish(fullText);
                    }}
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
                    title="Прослушать предложение"
                  >
                    <Volume2 size={14} />
                    Озвучить
                  </button>

                  {blankItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setBlankItems(blankItems.filter((_, i) => i !== idx));
                      }}
                      style={{
                        border: 'none',
                        background: '#fee2e2',
                        color: 'var(--error)',
                        borderRadius: '8px',
                        padding: '5px 8px',
                        cursor: 'pointer',
                      }}
                      title="Удалить предложение"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* 4 segment inline inputs: prefix -> GAP ANSWER -> HINT -> suffix */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1.2fr 2fr', gap: '10px' }}>
                <div>
                  <label style={subLabelStyle}>Текст до пропуска</label>
                  <input
                    type="text"
                    value={item.prefixText}
                    onChange={(e) => {
                      setBlankItems(blankItems.map((it, i) => (i === idx ? { ...it, prefixText: e.target.value } : it)));
                    }}
                    placeholder="She usually..."
                    style={fieldInputStyle}
                  />
                </div>

                <div>
                  <label style={{ ...subLabelStyle, color: 'var(--primary)', fontWeight: 800 }}>
                    ★ Ответ (пропуск)
                  </label>
                  <input
                    type="text"
                    value={item.correctAnswer}
                    onChange={(e) => {
                      setBlankItems(blankItems.map((it, i) => (i === idx ? { ...it, correctAnswer: e.target.value } : it)));
                    }}
                    placeholder="drinks"
                    style={{
                      ...fieldInputStyle,
                      border: '2px solid var(--primary)',
                      background: '#ffffff',
                      fontWeight: 700,
                    }}
                  />
                </div>

                <div>
                  <label style={subLabelStyle}>Подсказка в скобках</label>
                  <input
                    type="text"
                    value={item.hint}
                    onChange={(e) => {
                      setBlankItems(blankItems.map((it, i) => (i === idx ? { ...it, hint: e.target.value } : it)));
                    }}
                    placeholder="drink"
                    style={fieldInputStyle}
                  />
                </div>

                <div>
                  <label style={subLabelStyle}>Текст после пропуска</label>
                  <input
                    type="text"
                    value={item.suffixText}
                    onChange={(e) => {
                      setBlankItems(blankItems.map((it, i) => (i === idx ? { ...it, suffixText: e.target.value } : it)));
                    }}
                    placeholder="coffee every morning."
                    style={fieldInputStyle}
                  />
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setBlankItems([
                ...blankItems,
                {
                  id: `b-${Date.now()}`,
                  prefixText: `${blankItems.length + 1}. `,
                  correctAnswer: 'answer',
                  hint: 'hint',
                  suffixText: '.',
                },
              ]);
            }}
            style={addButtonStyle}
          >
            <Plus size={16} />
            Добавить следующее предложение
          </button>
        </div>
      ) : (
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '10px',
            }}
          >
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Используйте синтаксис: <code>Текст [ответ] (подсказка) текст</code>
            </span>
            <button
              type="button"
              onClick={handleAddExample}
              style={{
                border: 'none',
                background: 'var(--primary-subtle)',
                color: 'var(--primary)',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Sparkles size={14} />
              + Пример предложения
            </button>
          </div>

          <textarea
            rows={8}
            value={blankLinesRaw}
            onChange={(e) => setBlankLinesRaw(e.target.value)}
            style={{
              width: '100%',
              fontFamily: 'var(--font-mono)',
              fontSize: '13.5px',
              padding: '14px',
              borderRadius: '12px',
              border: '1.5px solid var(--border-strong)',
              lineHeight: 1.6,
              boxSizing: 'border-box',
              outline: 'none',
            }}
          />
        </div>
      )}
    </div>
  );
};
