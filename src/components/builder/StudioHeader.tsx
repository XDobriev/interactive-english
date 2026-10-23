import React from 'react';
import { X, Eye, Edit3, Columns, Sparkles } from 'lucide-react';
import { sound } from '../../utils/audio';
interface StudioHeaderProps {
  title: string;
  onTitleChange: (value: string) => void;
  viewMode: 'editor' | 'split' | 'preview';
  onViewModeChange: (mode: 'editor' | 'split' | 'preview') => void;
  showAiBar: boolean;
  onToggleAiBar: () => void;
  onLoadPreset: (presetKey: string) => void;
  onClose: () => void;
}

export const StudioHeader: React.FC<StudioHeaderProps> = ({
  title,
  onTitleChange: setTitle,
  viewMode,
  onViewModeChange: setViewMode,
  showAiBar,
  onToggleAiBar,
  onLoadPreset: handleLoadPreset,
  onClose,
}) => {
  return (
    <header
      style={{
        height: '70px',
        padding: '0 28px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
        flexShrink: 0,
      }}
    >
      {/* Left: Brand badge & In-place editable Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            color: '#ffffff',
            padding: '6px 14px',
            borderRadius: '10px',
            fontSize: '12px',
            fontWeight: 800,
            letterSpacing: '0.04em',
            boxShadow: '0 4px 10px rgba(79, 70, 229, 0.25)',
          }}
        >
          <Sparkles size={14} />
          PROGRESSME STUDIO
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, maxWidth: '520px' }}>
          <Edit3 size={16} color="var(--primary)" />
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Название упражнения..."
            style={{
              fontSize: '17px',
              fontWeight: 700,
              fontFamily: 'var(--font-display)',
              color: 'var(--text-main)',
              border: '1px solid transparent',
              borderRadius: '8px',
              padding: '6px 10px',
              background: 'transparent',
              width: '100%',
              outline: 'none',
              transition: 'all 0.15s ease',
            }}
            onFocus={(e) => {
              e.target.style.background = '#ffffff';
              e.target.style.borderColor = 'var(--primary)';
              e.target.style.boxShadow = '0 0 0 3px rgba(79, 70, 229, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.borderColor = 'transparent';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>
      </div>

      {/* Center: View Switcher (Editor / Split / Preview) */}
      <div
        style={{
          display: 'flex',
          background: '#e2e8f0',
          padding: '4px',
          borderRadius: '12px',
          gap: '4px',
        }}
      >
        <button
          onClick={() => {
            sound.playClick();
            setViewMode('editor');
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 14px',
            borderRadius: '8px',
            border: 'none',
            background: viewMode === 'editor' ? '#ffffff' : 'transparent',
            color: viewMode === 'editor' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: viewMode === 'editor' ? 700 : 500,
            fontSize: '13px',
            cursor: 'pointer',
            boxShadow: viewMode === 'editor' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
            transition: 'all 0.15s ease',
          }}
        >
          <Edit3 size={15} />
          Конструктор
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setViewMode('split');
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 16px',
            borderRadius: '8px',
            border: 'none',
            background: viewMode === 'split' ? '#ffffff' : 'transparent',
            color: viewMode === 'split' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: viewMode === 'split' ? 700 : 500,
            fontSize: '13px',
            cursor: 'pointer',
            boxShadow: viewMode === 'split' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
            transition: 'all 0.15s ease',
          }}
        >
          <Columns size={15} />
          Сплит 50/50
          <span
            style={{
              background: 'var(--primary-subtle)',
              color: 'var(--primary)',
              fontSize: '10px',
              fontWeight: 800,
              padding: '2px 6px',
              borderRadius: '6px',
            }}
          >
            LIVE
          </span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setViewMode('preview');
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 14px',
            borderRadius: '8px',
            border: 'none',
            background: viewMode === 'preview' ? '#ffffff' : 'transparent',
            color: viewMode === 'preview' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: viewMode === 'preview' ? 700 : 500,
            fontSize: '13px',
            cursor: 'pointer',
            boxShadow: viewMode === 'preview' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
            transition: 'all 0.15s ease',
          }}
        >
          <Eye size={15} />
          Вид ученика
        </button>
      </div>

      {/* Right: Gemini AI Button, Presets Library & Close button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Gemini AI Generator trigger button */}
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            onToggleAiBar();
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            borderRadius: '10px',
            border: showAiBar ? '1.5px solid var(--primary)' : '1.5px solid #c7d2fe',
            background: showAiBar ? 'var(--primary)' : 'linear-gradient(135deg, #eef2ff 0%, #ede9fe 100%)',
            color: showAiBar ? '#ffffff' : 'var(--primary)',
            fontWeight: 700,
            fontSize: '13px',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-subtle)',
            transition: 'all 0.15s ease',
          }}
        >
          <Sparkles size={15} />
          Gemini AI
        </button>

        <div style={{ position: 'relative' }}>
          <select
            onChange={(e) => {
              if (e.target.value) {
                handleLoadPreset(e.target.value);
                e.target.value = '';
              }
            }}
            defaultValue=""
            style={{
              padding: '8px 14px',
              borderRadius: '10px',
              border: '1.5px solid var(--border-subtle)',
              background: 'var(--surface-white)',
              color: 'var(--text-main)',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              outline: 'none',
              boxShadow: 'var(--shadow-subtle)',
            }}
          >
            <option value="" disabled>
              📚 Библиотека шаблонов ESL...
            </option>
            <option value="airport_dialogue">✈️ Диалог в аэропорту (Пропуски, B1)</option>
            <option value="business_collocations">💼 Business Collocations (Пары, B2)</option>
            <option value="polite_requests">🧩 Polite Requests (Порядок слов, A2-B1)</option>
            <option value="coffee_ordering">☕ В кофейне Лондона (Пропуски, A1-A2)</option>
            <option value="phrasal_get">🗂 Фразовые глаголы GET (3D Карточки, B1-B2)</option>
            <option value="conditionals_quiz">🎯 Тест: Conditionals (Викторина, B2)</option>
            <option value="grammar_rule_audio">📖 Правило: Present Perfect + Аудио (A2-B1)</option>
          </select>
        </div>

        <button
          onClick={onClose}
          style={{
            background: '#f1f5f9',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            padding: '8px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.15s ease',
          }}
          title="Закрыть без сохранения"
        >
          <X size={20} />
        </button>
      </div>
    </header>
  );
};
