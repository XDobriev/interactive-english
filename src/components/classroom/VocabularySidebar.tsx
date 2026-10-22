import React, { useState } from 'react';
import { Volume2, Plus, X, Check, Dumbbell, Search } from 'lucide-react';
import type { VocabWord } from '../../types';
import { speakEnglish } from '../../utils/speech';
import { sound } from '../../utils/audio';
import { VocabularyTrainingModal } from './VocabularyTrainingModal';

interface VocabularySidebarProps {
  vocabulary: VocabWord[];
  onAddWord: (word: VocabWord) => void;
}

export const VocabularySidebar: React.FC<VocabularySidebarProps> = ({
  vocabulary,
  onAddWord,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showTraining, setShowTraining] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [newTerm, setNewTerm] = useState('');
  const [newTrans, setNewTrans] = useState('');
  const [newTranslation, setNewTranslation] = useState('');
  const [newContext, setNewContext] = useState('');

  const handlePronounce = (term: string) => {
    sound.playClick();
    speakEnglish(term);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTerm.trim() || !newTranslation.trim()) return;

    sound.playCorrect();
    onAddWord({
      id: `custom-v-${Date.now()}`,
      term: newTerm.trim(),
      transcription: newTrans.trim() || `/${newTerm.trim()}/`,
      translation: newTranslation.trim(),
      partOfSpeech: 'phrase',
      contextSentence: newContext.trim() || undefined,
    });

    setNewTerm('');
    setNewTrans('');
    setNewTranslation('');
    setNewContext('');
    setShowAddForm(false);
  };

  const filtered = vocabulary.filter(
    (w) =>
      w.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.translation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <aside className="sidebar-right-card">
        <div className="panel-heading" style={{ marginBottom: '12px' }}>
          <span>Словарь урока</span>
          <span
            style={{
              fontSize: '11px',
              background: 'var(--primary-subtle)',
              color: 'var(--primary)',
              padding: '2px 8px',
              borderRadius: '10px',
              fontWeight: 700,
            }}
          >
            {vocabulary.length} слов
          </span>
        </div>

        {/* Training CTA */}
        <button
          onClick={() => {
            sound.playClick();
            setShowTraining(true);
          }}
          className="btn btn-secondary"
          style={{
            width: '100%',
            marginBottom: '12px',
            padding: '8px 12px',
            fontSize: '12.5px',
            justifyContent: 'center',
            borderColor: 'var(--primary)',
            color: 'var(--primary)',
          }}
        >
          <Dumbbell size={14} />
          Тренировка слов (Интерактив)
        </button>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: '12px' }}>
          <Search size={14} color="var(--text-light)" style={{ position: 'absolute', left: '10px', top: '10px' }} />
          <input
            type="text"
            placeholder="Поиск по словарю..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '7px 10px 7px 30px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              fontSize: '12.5px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Words List */}
        <div className="vocab-list" style={{ maxHeight: '520px', overflowY: 'auto', paddingRight: '4px' }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 8px', color: 'var(--text-light)', fontSize: '13px' }}>
              Слова не найдены
            </div>
          ) : (
            filtered.map((w) => (
              <div key={w.id} className="vocab-card">
                <div className="vocab-row">
                  <span className="vocab-term">{w.term}</span>
                  <button
                    className="speaker-button"
                    onClick={() => handlePronounce(w.term)}
                    title="Послушать произношение"
                  >
                    <Volume2 size={15} />
                  </button>
                </div>
                <div className="vocab-phonetic">
                  {w.transcription} • {w.partOfSpeech}
                </div>
                <div className="vocab-meaning">{w.translation}</div>
                {w.contextSentence && (
                  <div className="vocab-example">"{w.contextSentence}"</div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Add New Word Form */}
        {showAddForm ? (
          <form
            onSubmit={handleSubmit}
            style={{
              background: 'var(--surface-subtle)',
              border: '1.5px solid var(--primary-border)',
              borderRadius: 'var(--radius-md)',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              marginTop: '12px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)' }}>
                Новое слово / фраза
              </span>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={15} />
              </button>
            </div>

            <input
              type="text"
              placeholder="Слово (напр. delay)"
              value={newTerm}
              onChange={(e) => setNewTerm(e.target.value)}
              required
              style={inputStyle}
            />
            <input
              type="text"
              placeholder="Транскрипция (напр. /dɪˈleɪ/)"
              value={newTrans}
              onChange={(e) => setNewTrans(e.target.value)}
              style={inputStyle}
            />
            <input
              type="text"
              placeholder="Перевод на русский"
              value={newTranslation}
              onChange={(e) => setNewTranslation(e.target.value)}
              required
              style={inputStyle}
            />
            <input
              type="text"
              placeholder="Пример в предложении (опционально)"
              value={newContext}
              onChange={(e) => setNewContext(e.target.value)}
              style={inputStyle}
            />

            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ flex: 1, padding: '7px 0', justifyContent: 'center', fontSize: '12.5px' }}
              >
                <Check size={14} />
                Добавить
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ padding: '7px 12px', fontSize: '12.5px' }}
                onClick={() => setShowAddForm(false)}
              >
                Отмена
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => {
              sound.playClick();
              setShowAddForm(true);
            }}
            className="btn btn-secondary"
            style={{
              width: '100%',
              marginTop: '12px',
              padding: '8px 12px',
              fontSize: '12.5px',
              justifyContent: 'center',
              borderStyle: 'dashed',
            }}
          >
            <Plus size={14} />
            Добавить слово в словарь
          </button>
        )}
      </aside>

      {/* Spaced Repetition Word Trainer Modal */}
      {showTraining && (
        <VocabularyTrainingModal
          vocabulary={vocabulary}
          onClose={() => setShowTraining(false)}
        />
      )}
    </>
  );
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '7px 10px',
  borderRadius: '6px',
  border: '1px solid var(--border-subtle)',
  fontSize: '12.5px',
  boxSizing: 'border-box',
  outline: 'none',
  background: 'var(--surface-white)',
};
