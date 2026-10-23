import type { FC } from 'react';
import { Plus, Trash2, Volume2 } from 'lucide-react';
import { sound } from '../../../utils/audio';
import { type FormProps, speakEnglish, subLabelStyle, fieldInputStyle, addButtonStyle } from './formShared';

export const MediaRuleForm: FC<FormProps> = ({ draft, onChange }) => {
  const { ruleTitle, ruleContent, speechAccent, speechSpeed, prompts } = draft;
  const setRuleTitle = (value: string) => onChange({ ruleTitle: value });
  const setRuleContent = (value: string) => onChange({ ruleContent: value });
  const setSpeechAccent = (value: 'en-GB' | 'en-US') => onChange({ speechAccent: value });
  const setSpeechSpeed = (value: number) => onChange({ speechSpeed: value });
  const setPrompts = (value: string[]) => onChange({ prompts: value });

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
          Конструктор правила и аудирования (Rule & Audio)
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
          Теоретический блок с синтезом речи и разговорными вопросами для отработки вслух.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={subLabelStyle}>Заголовок грамматического правила</label>
          <input
            type="text"
            value={ruleTitle}
            onChange={(e) => setRuleTitle(e.target.value)}
            placeholder="Present Perfect vs Past Simple..."
            style={{ ...fieldInputStyle, fontSize: '15px', fontWeight: 700 }}
          />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label style={subLabelStyle}>Содержание правила (форматирование текстом)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <select
                value={speechAccent}
                onChange={(e) => setSpeechAccent(e.target.value as 'en-GB' | 'en-US')}
                style={{
                  fontSize: '12px',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <option value="en-GB">🇬🇧 British Voice</option>
                <option value="en-US">🇺🇸 American Voice</option>
              </select>

              <select
                value={speechSpeed}
                onChange={(e) => setSpeechSpeed(Number(e.target.value))}
                style={{
                  fontSize: '12px',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <option value={0.8}>0.8x Скорость</option>
                <option value={1.0}>1.0x Скорость</option>
                <option value={1.2}>1.2x Скорость</option>
              </select>

              <button
                type="button"
                onClick={() => speakEnglish(ruleContent, speechAccent, speechSpeed)}
                style={{
                  border: 'none',
                  background: 'var(--primary-subtle)',
                  color: 'var(--primary)',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Volume2 size={13} />
                Тест звука
              </button>
            </div>
          </div>
          <textarea
            rows={6}
            value={ruleContent}
            onChange={(e) => setRuleContent(e.target.value)}
            placeholder="Объяснение формулы, примеры употребления, маркеры времени..."
            style={{
              ...fieldInputStyle,
              lineHeight: 1.5,
              fontFamily: 'inherit',
            }}
          />
        </div>

        <div>
          <label style={subLabelStyle}>Вопросы для обсуждения (Speaking Discussion Prompts)</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {prompts.map((p, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-light)', fontWeight: 700, width: '20px' }}>
                  #{idx + 1}
                </span>
                <input
                  type="text"
                  value={p}
                  onChange={(e) => {
                    const updated = [...prompts];
                    updated[idx] = e.target.value;
                    setPrompts(updated);
                  }}
                  placeholder="Have you ever lost something valuable while travelling?"
                  style={fieldInputStyle}
                />
                {prompts.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setPrompts(prompts.filter((_, i) => i !== idx));
                    }}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      color: 'var(--text-light)',
                      cursor: 'pointer',
                    }}
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setPrompts([...prompts, '']);
              }}
              style={addButtonStyle}
            >
              <Plus size={16} />
              Добавить вопрос для Speaking
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
