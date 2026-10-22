import React, { useState } from 'react';
import {
  Plus,
  Play,
  Edit3,
  Copy,
  Trash2,
  GraduationCap,
  Sparkles,
  Users,
  Calendar,
  FileCheck,
  BookOpen,
  Link2,
  Check,
  Search,
  Loader2,
  X,
} from 'lucide-react';
import type { Lesson, CEFRLevel, Student, ScheduleEvent, HomeworkSubmission } from '../../types';
import { StudentsTab } from './StudentsTab';
import { ScheduleTab } from './ScheduleTab';
import { HomeworkTab } from './HomeworkTab';
import { sound } from '../../utils/audio';
import { generateFullLessonWithGemini } from '../../services/gemini';

interface TeacherDashboardProps {
  lessons: Lesson[];
  students: Student[];
  scheduleEvents: ScheduleEvent[];
  homeworkSubmissions: HomeworkSubmission[];
  onStartLesson: (lesson: Lesson, role: 'teacher' | 'student', studentName?: string) => void;
  onEditLesson: (lesson: Lesson) => void;
  onCreateLesson: () => void;
  onDuplicateLesson: (lesson: Lesson) => void;
  onDeleteLesson: (lessonId: string) => void;
  onUpdateStudents: (updated: Student[]) => void;
  onUpdateScheduleEvents: (updated: ScheduleEvent[]) => void;
  onUpdateHomeworkSubmissions: (updated: HomeworkSubmission[]) => void;
  onAssignHomework: (studentId: string, lessonId: string) => void;
}

type DashboardTab = 'lessons' | 'students' | 'schedule' | 'homework';

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  lessons,
  students,
  scheduleEvents,
  homeworkSubmissions,
  onStartLesson,
  onEditLesson,
  onCreateLesson,
  onDuplicateLesson,
  onDeleteLesson,
  onUpdateStudents,
  onUpdateScheduleEvents,
  onUpdateHomeworkSubmissions,
  onAssignHomework,
}) => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('lessons');
  const [selectedLevel, setSelectedLevel] = useState<CEFRLevel | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredLessons = lessons
    .filter((l) => (selectedLevel === 'ALL' ? true : l.level === selectedLevel))
    .filter((l) =>
      searchQuery
        ? l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          l.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
          l.description.toLowerCase().includes(searchQuery.toLowerCase())
        : true
    );

  const pendingHomeworkCount = homeworkSubmissions.filter((h) => h.status === 'pending_review').length;

  const handleCopyLink = (lessonId: string) => {
    sound.playClick();
    const url = `${window.location.origin}${window.location.pathname}?lesson=${lessonId}&role=student`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).catch(() => {});
    }
    setCopiedId(lessonId);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Gemini AI Lesson Generation State
  const [showAiLessonModal, setShowAiLessonModal] = useState(false);
  const [aiLessonTopic, setAiLessonTopic] = useState('');
  const [aiLessonLevel, setAiLessonLevel] = useState<CEFRLevel>('B1');
  const [isGeneratingFullLesson, setIsGeneratingFullLesson] = useState(false);
  const [aiLessonError, setAiLessonError] = useState<string | null>(null);

  const handleGenerateFullLesson = async () => {
    if (!aiLessonTopic.trim()) return;
    setIsGeneratingFullLesson(true);
    setAiLessonError(null);
    sound.playClick();
    try {
      const newLesson = await generateFullLessonWithGemini(aiLessonTopic.trim(), aiLessonLevel);
      sound.playCorrect();
      setShowAiLessonModal(false);
      setAiLessonTopic('');
      onEditLesson(newLesson);
    } catch (err: any) {
      setAiLessonError(err.message || 'Ошибка генерации урока Gemini AI');
      sound.playIncorrect();
    } finally {
      setIsGeneratingFullLesson(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Navbar */}
      <header className="topbar dashboard-topbar">
        <div className="dashboard-topbar-brand-section">
          <div className="brand-logo">
            <div className="brand-icon">EN</div>
            <div className="brand-name">
              <span>ProgressMe</span> <span className="brand-subname">English Studio</span>
            </div>
          </div>
        </div>

        {/* Main Navigation Tabs */}
        <nav className="dashboard-nav-tabs">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('lessons');
            }}
            className={`dashboard-tab-btn ${activeTab === 'lessons' ? 'active' : ''}`}
          >
            <BookOpen size={15} />
            <span>Материалы</span>
            <span className="tab-counter-badge">{lessons.length}</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('students');
            }}
            className={`dashboard-tab-btn ${activeTab === 'students' ? 'active' : ''}`}
          >
            <Users size={15} />
            <span>Ученики</span>
            <span className="tab-counter-badge">{students.length}</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('schedule');
            }}
            className={`dashboard-tab-btn ${activeTab === 'schedule' ? 'active' : ''}`}
          >
            <Calendar size={15} />
            <span>Расписание</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('homework');
            }}
            className={`dashboard-tab-btn ${activeTab === 'homework' ? 'active' : ''}`}
          >
            <FileCheck size={15} />
            <span>Домашние задания</span>
            {pendingHomeworkCount > 0 && (
              <span className="tab-pending-badge">
                {pendingHomeworkCount}
              </span>
            )}
          </button>
        </nav>

        {/* Topbar Actions */}
        <div className="dashboard-topbar-actions">
          <button
            className="btn btn-secondary btn-dashboard-ai"
            onClick={() => {
              sound.playClick();
              setShowAiLessonModal(true);
            }}
            title="Сгенерировать урок с помощью нейросети Gemini"
          >
            <Sparkles size={16} color="#4f46e5" />
            <span className="btn-label-desktop">Создать с Gemini AI</span>
            <span className="btn-label-mobile">Gemini AI</span>
          </button>

          <button className="btn btn-primary btn-dashboard-create" onClick={onCreateLesson} title="Создать новый урок вручную">
            <Plus size={16} />
            <span className="btn-label-desktop">Создать новый урок</span>
            <span className="btn-label-mobile">Урок</span>
          </button>
        </div>
      </header>


      {/* Main Content */}
      <main className="dashboard-main-container">
        
        {/* Welcome Hero Banner */}
        <div className="dashboard-hero-banner">
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(255, 255, 255, 0.12)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '11.5px',
                fontWeight: 700,
                color: '#c7d2fe',
                marginBottom: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              <Sparkles size={14} />
              ProgressMe Alternative • English Platform
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 800, marginBottom: '6px', letterSpacing: '-0.02em' }}>
              Интерактивная студия онлайн-преподавания
            </h1>
            <p style={{ fontSize: '14.5px', color: '#cbd5e1', maxWidth: '640px', lineHeight: 1.5 }}>
              Виртуальный класс в реальном времени, 6 видов интерактивных заданий, встроенный словарь, расписание и домашние задания с автоматической проверкой.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '14px' }}>
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: 'var(--radius-md)',
                padding: '14px 20px',
                textAlign: 'center',
                minWidth: '100px',
              }}
            >
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 800, color: '#ffffff' }}>
                {lessons.length}
              </div>
              <div style={{ fontSize: '12px', color: '#c7d2fe', fontWeight: 600 }}>
                Готовых уроков
              </div>
            </div>

            <div
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: 'var(--radius-md)',
                padding: '14px 20px',
                textAlign: 'center',
                minWidth: '100px',
              }}
            >
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 800, color: '#38bdf8' }}>
                {students.length}
              </div>
              <div style={{ fontSize: '12px', color: '#c7d2fe', fontWeight: 600 }}>
                Учеников
              </div>
            </div>
          </div>
        </div>

        {/* Tab 1: Lessons & Materials */}
        {activeTab === 'lessons' && (
          <div>
            {/* Filter Tabs & Search */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {(['ALL', 'A1', 'A2', 'B1', 'B2', 'C1'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => {
                      sound.playClick();
                      setSelectedLevel(lvl);
                    }}
                    style={{
                      border: 'none',
                      background: selectedLevel === lvl ? 'var(--primary)' : 'var(--surface-white)',
                      color: selectedLevel === lvl ? '#ffffff' : 'var(--text-muted)',
                      padding: '7px 16px',
                      borderRadius: '20px',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: selectedLevel === lvl ? '0 2px 6px rgba(79, 70, 229, 0.25)' : 'var(--shadow-subtle)',
                      borderWidth: selectedLevel === lvl ? '0' : '1px',
                      borderStyle: 'solid',
                      borderColor: 'var(--border-subtle)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {lvl === 'ALL' ? 'Все уровни' : lvl}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div style={{ position: 'relative', width: '280px' }}>
                <Search size={15} color="var(--text-light)" style={{ position: 'absolute', left: '12px', top: '10px' }} />
                <input
                  type="text"
                  placeholder="Поиск по урокам..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 34px',
                    borderRadius: '20px',
                    border: '1.5px solid var(--border-subtle)',
                    fontSize: '13px',
                    outline: 'none',
                    background: 'var(--surface-white)',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            {/* Lesson Cards Grid */}
            <div className="dashboard-lessons-grid">
              {filteredLessons.map((lesson) => {
                const exerciseCount = lesson.sections.reduce((acc, s) => acc + s.exercises.length, 0);
                const isCopied = copiedId === lesson.id;

                return (
                  <div
                    key={lesson.id}
                    className="app-card"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      borderRadius: 'var(--radius-lg)',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                        <span className="level-badge">{lesson.level}</span>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-light)' }}>
                          Юнит {lesson.unitNumber}
                        </span>
                      </div>

                      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px', lineHeight: 1.35 }}>
                        {lesson.title}
                      </h3>

                      <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginBottom: '18px', lineHeight: 1.5, minHeight: '40px' }}>
                        {lesson.description}
                      </p>

                      <div
                        style={{
                          display: 'flex',
                          gap: '14px',
                          fontSize: '12.5px',
                          color: 'var(--text-muted)',
                          padding: '10px 14px',
                          background: 'var(--surface-subtle)',
                          borderRadius: '8px',
                          marginBottom: '20px',
                        }}
                      >
                        <span>📑 {lesson.sections.length} секций</span>
                        <span>🧩 {exerciseCount} упражнений</span>
                        <span>📖 {lesson.vocabulary.length} слов</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ paddingTop: '16px', borderTop: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <button
                          className="btn btn-primary"
                          onClick={() => onStartLesson(lesson, 'teacher')}
                          title="Начать занятие с подсказками учителя"
                        >
                          <Play size={15} />
                          Вести урок
                        </button>
                        <button
                          className="btn btn-secondary"
                          onClick={() => onStartLesson(lesson, 'student')}
                          title="Открыть экран выполнения для ученика"
                        >
                          <GraduationCap size={15} />
                          Вид ученика
                        </button>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => onEditLesson(lesson)}
                            className="btn btn-secondary"
                            style={{ padding: '5px 10px', fontSize: '12px' }}
                            title="Редактировать материалы урока"
                          >
                            <Edit3 size={13} />
                            Изменить
                          </button>

                          <button
                            onClick={() => handleCopyLink(lesson.id)}
                            className="btn btn-secondary"
                            style={{ padding: '5px 10px', fontSize: '12px', color: isCopied ? 'var(--success)' : undefined }}
                            title="Скопировать прямую ссылку для ученика"
                          >
                            {isCopied ? <Check size={13} /> : <Link2 size={13} />}
                            {isCopied ? 'Скопировано!' : 'Ссылка'}
                          </button>
                        </div>

                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            onClick={() => onDuplicateLesson(lesson)}
                            className="btn btn-secondary"
                            style={{ padding: '5px 8px', color: 'var(--text-muted)' }}
                            title="Дублировать урок"
                          >
                            <Copy size={13} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Удалить урок "${lesson.title}"?`)) {
                                onDeleteLesson(lesson.id);
                              }
                            }}
                            className="btn btn-secondary"
                            style={{ padding: '5px 8px', color: 'var(--error)' }}
                            title="Удалить урок"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Students & Lesson Balances */}
        {activeTab === 'students' && (
          <StudentsTab
            students={students}
            lessons={lessons}
            onStartLessonWithStudent={(ls, st) => onStartLesson(ls, 'teacher', st.name)}
            onUpdateStudents={onUpdateStudents}
          />
        )}

        {/* Tab 3: Schedule & Calendar */}
        {activeTab === 'schedule' && (
          <ScheduleTab
            events={scheduleEvents}
            students={students}
            lessons={lessons}
            onStartLesson={(ls, stName) => onStartLesson(ls, 'teacher', stName)}
            onUpdateEvents={onUpdateScheduleEvents}
          />
        )}

        {/* Tab 4: Homework Submissions */}
        {activeTab === 'homework' && (
          <HomeworkTab
            submissions={homeworkSubmissions}
            students={students}
            lessons={lessons}
            onUpdateSubmissions={onUpdateHomeworkSubmissions}
            onAssignHomework={onAssignHomework}
          />
        )}

      </main>

      {/* Gemini AI Full Lesson Generation Modal */}
      {showAiLessonModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(6px)',
            zIndex: 300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              maxWidth: '560px',
              width: '100%',
              padding: '28px',
              boxShadow: 'var(--shadow-float)',
              border: '1.5px solid #c7d2fe',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                    color: '#ffffff',
                    padding: '8px',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>Создание урока с Gemini AI</h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                    ИИ составит цели, словарь и 3 секции с интерактивными заданиями
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowAiLessonModal(false)}
                style={{
                  border: 'none',
                  background: '#f1f5f9',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  ТЕМА ИЛИ ЛЕКСИЧЕСКИЙ ФОКУС УРОКА
                </label>
                <input
                  type="text"
                  value={aiLessonTopic}
                  onChange={(e) => setAiLessonTopic(e.target.value)}
                  placeholder="Например: Job Interview Prep, Travel Dilemmas, Ordering Food at a Restaurant..."
                  style={{
                    width: '100%',
                    fontFamily: 'inherit',
                    fontSize: '14px',
                    padding: '11px 14px',
                    borderRadius: '10px',
                    border: '1.5px solid var(--border-strong)',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  ЦЕЛЕВОЙ УРОВЕНЬ CEFR
                </label>
                <select
                  value={aiLessonLevel}
                  onChange={(e) => setAiLessonLevel(e.target.value as CEFRLevel)}
                  style={{
                    width: '100%',
                    fontFamily: 'inherit',
                    fontSize: '14px',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1.5px solid var(--border-strong)',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontWeight: 600,
                  }}
                >
                  <option value="A1">A1 Beginner</option>
                  <option value="A2">A2 Elementary</option>
                  <option value="B1">B1 Intermediate</option>
                  <option value="B2">B2 Upper-Intermediate</option>
                  <option value="C1">C1 Advanced</option>
                </select>
              </div>

              {/* Quick Prompt Ideas */}
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-light)', display: 'block', marginBottom: '6px' }}>
                  Быстрые популярные темы:
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {[
                    'At a London Café (A2)',
                    'Job Interview & Business English (B2)',
                    'Lost Luggage at the Airport (B1)',
                    'Small Talk & First Meetings (A1)',
                    'Persuasion & Rhetoric (C1)',
                  ].map((idea) => (
                    <button
                      key={idea}
                      type="button"
                      onClick={() => {
                        const levelMatch = idea.match(/\(([A-C][1-2])\)/);
                        const cleanTopic = idea.replace(/\s*\([A-C][1-2]\)/, '');
                        setAiLessonTopic(cleanTopic);
                        if (levelMatch) setAiLessonLevel(levelMatch[1] as CEFRLevel);
                      }}
                      style={{
                        border: '1px solid #c7d2fe',
                        background: '#eef2ff',
                        color: 'var(--primary)',
                        padding: '4px 10px',
                        borderRadius: '8px',
                        fontSize: '11.5px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {idea}
                    </button>
                  ))}
                </div>
              </div>

              {aiLessonError && (
                <div style={{ color: 'var(--error)', fontSize: '12px', fontWeight: 600 }}>
                  ⚠️ {aiLessonError}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowAiLessonModal(false)}
                disabled={isGeneratingFullLesson}
              >
                Отмена
              </button>

              <button
                type="button"
                disabled={isGeneratingFullLesson || !aiLessonTopic.trim()}
                onClick={handleGenerateFullLesson}
                style={{
                  background: isGeneratingFullLesson ? '#94a3b8' : 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '11px 22px',
                  fontSize: '14px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: isGeneratingFullLesson ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)',
                }}
              >
                {isGeneratingFullLesson ? (
                  <>
                    <Loader2 size={16} className="spin-animate" />
                    Составляю урок с Gemini...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Сгенерировать урок
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
