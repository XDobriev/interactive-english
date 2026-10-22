import React, { useState } from 'react';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Download,
  Upload,
  BookOpen,
  Edit3,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import type { Lesson, LessonSection, Exercise, CEFRLevel } from '../../types';
import { sound } from '../../utils/audio';
import { AddExerciseModal } from './AddExerciseModal';

interface LessonBuilderProps {
  initialLesson?: Lesson;
  onSave: (lesson: Lesson) => void;
  onCancel: () => void;
}

export const LessonBuilder: React.FC<LessonBuilderProps> = ({
  initialLesson,
  onSave,
  onCancel,
}) => {
  const [lesson, setLesson] = useState<Lesson>(
    initialLesson || {
      id: `custom-lesson-${Date.now()}`,
      title: 'Новый урок английского',
      unitNumber: 1,
      level: 'B1',
      topic: 'General English Practice',
      description: 'Описание целей и лексической темы урока',
      vocabulary: [],
      sections: [
        {
          id: `sec-${Date.now()}-1`,
          sectionNumber: 1,
          title: 'Warm-up & Vocabulary',
          subtitle: 'Вводные вопросы и новая лексика',
          exercises: [],
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  );

  const [activeSectionId, setActiveSectionId] = useState<string>(
    lesson.sections[0]?.id || ''
  );

  // Modal for adding / editing an exercise
  const [showAddModal, setShowAddModal] = useState(false);
  const [exerciseToEdit, setExerciseToEdit] = useState<Exercise | null>(null);

  const activeSection = lesson.sections.find((s) => s.id === activeSectionId) || lesson.sections[0];

  const handleAddSection = () => {
    sound.playClick();
    const newSec: LessonSection = {
      id: `sec-${Date.now()}`,
      sectionNumber: lesson.sections.length + 1,
      title: `Новая секция ${lesson.sections.length + 1}`,
      subtitle: 'Описание этапа',
      exercises: [],
    };
    setLesson({
      ...lesson,
      sections: [...lesson.sections, newSec],
    });
    setActiveSectionId(newSec.id);
  };

  const handleDeleteSection = (sectionId: string) => {
    if (lesson.sections.length <= 1) {
      alert('Урок должен содержать хотя бы одну секцию.');
      return;
    }
    sound.playClick();
    const updatedSecs = lesson.sections.filter((s) => s.id !== sectionId);
    setLesson({ ...lesson, sections: updatedSecs });
    if (activeSectionId === sectionId) {
      setActiveSectionId(updatedSecs[0]?.id || '');
    }
  };

  const handleSaveExercise = (savedExercise: Exercise) => {
    if (!activeSection) return;
    const updatedSections = lesson.sections.map((sec) => {
      if (sec.id === activeSection.id) {
        const exists = sec.exercises.some((e) => e.id === savedExercise.id);
        if (exists) {
          return {
            ...sec,
            exercises: sec.exercises.map((e) => (e.id === savedExercise.id ? savedExercise : e)),
          };
        }
        return {
          ...sec,
          exercises: [...sec.exercises, savedExercise],
        };
      }
      return sec;
    });

    setLesson({ ...lesson, sections: updatedSections });
    setExerciseToEdit(null);
  };

  const handleMoveExercise = (idx: number, direction: 'up' | 'down') => {
    sound.playClick();
    if (!activeSection) return;
    const newIndex = direction === 'up' ? idx - 1 : idx + 1;
    if (newIndex < 0 || newIndex >= activeSection.exercises.length) return;
    const copy = [...activeSection.exercises];
    const [moved] = copy.splice(idx, 1);
    copy.splice(newIndex, 0, moved);
    const updatedSections = lesson.sections.map((sec) =>
      sec.id === activeSection.id ? { ...sec, exercises: copy } : sec
    );
    setLesson({ ...lesson, sections: updatedSections });
  };

  const handleDeleteExercise = (exId: string) => {
    sound.playClick();
    if (!activeSection) return;
    const updatedSecs = lesson.sections.map((sec) => {
      if (sec.id === activeSection.id) {
        return {
          ...sec,
          exercises: sec.exercises.filter((ex) => ex.id !== exId),
        };
      }
      return sec;
    });
    setLesson({ ...lesson, sections: updatedSecs });
  };

  const handleExportJSON = () => {
    sound.playClick();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(lesson, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${lesson.title.replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          setLesson(parsed);
          setActiveSectionId(parsed.sections[0]?.id || '');
          sound.playCorrect();
        } catch (err) {
          alert('Ошибка чтения JSON файла.');
        }
      };
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Builder Bar */}
      <header className="topbar">
        <div className="topbar-left">
          <button className="btn btn-secondary" onClick={onCancel}>
            <ArrowLeft size={16} />
            Назад
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={20} color="var(--primary)" />
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: 700 }}>
              Конструктор интерактивного урока
            </h2>
          </div>
        </div>

        <div className="topbar-right">
          <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
            <Upload size={15} />
            Импорт JSON
            <input type="file" accept=".json" onChange={handleImportJSON} style={{ display: 'none' }} />
          </label>

          <button className="btn btn-secondary" onClick={handleExportJSON}>
            <Download size={15} />
            Экспорт в файл
          </button>

          <button
            className="btn btn-primary"
            onClick={() => {
              sound.playCorrect();
              onSave(lesson);
            }}
          >
            <Save size={15} />
            Сохранить урок
          </button>
        </div>
      </header>

      {/* Main Builder Form */}
      <div style={{ maxWidth: '1200px', margin: '32px auto', width: '100%', padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
        
        {/* Lesson Metadata Card */}
        <div className="app-card">
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>
            Основная информация об уроке
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={labelStyle}>Название урока</label>
              <input
                type="text"
                value={lesson.title}
                onChange={(e) => setLesson({ ...lesson, title: e.target.value })}
                style={inputStyle}
                placeholder="Например: Travel Dilemmas & Lost Luggage"
              />
            </div>

            <div>
              <label style={labelStyle}>Уровень CEFR</label>
              <select
                value={lesson.level}
                onChange={(e) => setLesson({ ...lesson, level: e.target.value as CEFRLevel })}
                style={inputStyle}
              >
                <option value="A1">A1 Beginner</option>
                <option value="A2">A2 Elementary</option>
                <option value="B1">B1 Intermediate</option>
                <option value="B2">B2 Upper-Intermediate</option>
                <option value="C1">C1 Advanced</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Номер юнита</label>
              <input
                type="number"
                value={lesson.unitNumber}
                onChange={(e) => setLesson({ ...lesson, unitNumber: Number(e.target.value) || 1 })}
                style={inputStyle}
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Краткое описание / цели урока</label>
            <input
              type="text"
              value={lesson.description}
              onChange={(e) => setLesson({ ...lesson, description: e.target.value })}
              style={inputStyle}
              placeholder="Чему ученик научится за этот урок..."
            />
          </div>
        </div>

        {/* Sections and Exercises Container */}
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '24px' }}>
          
          {/* Left: Sections List */}
          <div className="app-card" style={{ height: 'fit-content' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-light)', textTransform: 'uppercase' }}>
                Секции урока
              </span>
              <button
                className="btn btn-secondary"
                style={{ padding: '4px 10px', fontSize: '12px' }}
                onClick={handleAddSection}
              >
                <Plus size={14} />
                Секция
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {lesson.sections.map((sec, idx) => (
                <div
                  key={sec.id}
                  onClick={() => setActiveSectionId(sec.id)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: sec.id === activeSectionId ? '1.5px solid var(--primary)' : '1px solid var(--border-subtle)',
                    background: sec.id === activeSectionId ? 'var(--primary-subtle)' : 'var(--surface-white)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '13.5px', fontWeight: 700, color: sec.id === activeSectionId ? 'var(--primary)' : 'var(--text-main)' }}>
                      {idx + 1}. {sec.title}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {sec.exercises.length} упражнений
                    </div>
                  </div>

                  {lesson.sections.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSection(sec.id);
                      }}
                      style={{ border: 'none', background: 'transparent', color: 'var(--text-light)', cursor: 'pointer' }}
                      title="Удалить секцию"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right: Section Details & Exercises */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {activeSection && (
              <div className="app-card">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  <div>
                    <label style={labelStyle}>Название текущей секции</label>
                    <input
                      type="text"
                      value={activeSection.title}
                      onChange={(e) => {
                        const updated = lesson.sections.map((s) =>
                          s.id === activeSection.id ? { ...s, title: e.target.value } : s
                        );
                        setLesson({ ...lesson, sections: updated });
                      }}
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Подзаголовок</label>
                    <input
                      type="text"
                      value={activeSection.subtitle}
                      onChange={(e) => {
                        const updated = lesson.sections.map((s) =>
                          s.id === activeSection.id ? { ...s, subtitle: e.target.value } : s
                        );
                        setLesson({ ...lesson, sections: updated });
                      }}
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
                  <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 700 }}>
                    Упражнения в этой секции ({activeSection.exercises.length})
                  </h4>

                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      sound.playClick();
                      setExerciseToEdit(null);
                      setShowAddModal(true);
                    }}
                  >
                    <Plus size={15} />
                    Добавить упражнение
                  </button>
                </div>

                {activeSection.exercises.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '36px', border: '1.5px dashed var(--border-strong)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)' }}>
                    В этой секции пока нет упражнений. Нажмите <strong>«Добавить упражнение»</strong> выше.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {activeSection.exercises.map((ex, exIdx) => {
                      const typeBadgeConfig: Record<string, { label: string; bg: string; color: string; icon: string }> = {
                        fill_blanks: { label: 'Пропуски', bg: '#eef2ff', color: '#4f46e5', icon: '✏️' },
                        match_pairs: { label: 'Пары', bg: '#e0f2fe', color: '#0284c7', icon: '🔀' },
                        word_order: { label: 'Порядок слов', bg: '#ecfdf5', color: '#059669', icon: '🧩' },
                        flashcards: { label: 'Карточки 3D', bg: '#fffbeb', color: '#d97706', icon: '🗂' },
                        quiz: { label: 'Тест', bg: '#f5f3ff', color: '#7c3aed', icon: '🔘' },
                        media_rule: { label: 'Правило', bg: '#ffe4e6', color: '#e11d48', icon: '📖' },
                      };
                      const cfg = typeBadgeConfig[ex.type] || {
                        label: ex.type,
                        bg: 'var(--primary-subtle)',
                        color: 'var(--primary)',
                        icon: '📝',
                      };

                      return (
                        <div
                          key={ex.id}
                          style={{
                            background: '#ffffff',
                            border: '1.5px solid var(--border-subtle)',
                            borderRadius: 'var(--radius-md)',
                            padding: '16px 20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            boxShadow: 'var(--shadow-subtle)',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: 0 }}>
                            {/* Reorder Arrows */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              <button
                                type="button"
                                disabled={exIdx === 0}
                                onClick={() => handleMoveExercise(exIdx, 'up')}
                                style={{
                                  border: 'none',
                                  background: 'transparent',
                                  color: exIdx === 0 ? '#cbd5e1' : 'var(--text-muted)',
                                  cursor: exIdx === 0 ? 'default' : 'pointer',
                                  padding: '2px',
                                  display: 'flex',
                                  alignItems: 'center',
                                }}
                                title="Поднять выше"
                              >
                                <ArrowUp size={14} />
                              </button>
                              <button
                                type="button"
                                disabled={exIdx === activeSection.exercises.length - 1}
                                onClick={() => handleMoveExercise(exIdx, 'down')}
                                style={{
                                  border: 'none',
                                  background: 'transparent',
                                  color: exIdx === activeSection.exercises.length - 1 ? '#cbd5e1' : 'var(--text-muted)',
                                  cursor: exIdx === activeSection.exercises.length - 1 ? 'default' : 'pointer',
                                  padding: '2px',
                                  display: 'flex',
                                  alignItems: 'center',
                                }}
                                title="Опустить ниже"
                              >
                                <ArrowDown size={14} />
                              </button>
                            </div>

                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                <span
                                  style={{
                                    fontSize: '11px',
                                    fontWeight: 800,
                                    background: cfg.bg,
                                    color: cfg.color,
                                    padding: '2px 8px',
                                    borderRadius: '6px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                  }}
                                >
                                  <span>{cfg.icon}</span>
                                  {cfg.label}
                                </span>

                                <span style={{ fontWeight: 800, fontSize: '15px', color: 'var(--text-main)' }}>
                                  {exIdx + 1}. {ex.title}
                                </span>

                                <span
                                  style={{
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    color: 'var(--text-light)',
                                    background: '#f1f5f9',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                  }}
                                >
                                  {ex.scoreWeight} б.
                                </span>
                              </div>

                              <div style={{ fontSize: '13px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {ex.instruction}
                              </div>
                            </div>
                          </div>

                          {/* Exercise Card Actions: Edit & Delete */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '16px' }}>
                            <button
                              type="button"
                              onClick={() => {
                                sound.playClick();
                                setExerciseToEdit(ex);
                                setShowAddModal(true);
                              }}
                              className="btn btn-secondary"
                              style={{ padding: '6px 12px', fontSize: '12.5px', gap: '6px' }}
                              title="Редактировать упражнение"
                            >
                              <Edit3 size={13} color="var(--primary)" />
                              Изменить
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteExercise(ex.id)}
                              className="btn btn-danger"
                              style={{ padding: '6px 10px', fontSize: '12px' }}
                              title="Удалить упражнение"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* ProgressMe Exercise Studio Modal */}
      <AddExerciseModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setExerciseToEdit(null);
        }}
        onAddExercise={handleSaveExercise}
        exerciseToEdit={exerciseToEdit}
      />

    </div>
  );
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 700,
  color: 'var(--text-muted)',
  marginBottom: '6px',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  fontFamily: 'inherit',
  fontSize: '14px',
  padding: '10px 14px',
  borderRadius: '8px',
  border: '1.5px solid var(--border-strong)',
  background: 'var(--surface-white)',
  color: 'var(--text-main)',
  outline: 'none',
  boxSizing: 'border-box',
};
