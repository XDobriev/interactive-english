import React, { useState } from 'react';
import { Plus, UserPlus, Play, FileText, CheckCircle2, Clock, Mail, X } from 'lucide-react';
import type { Student, Lesson, CEFRLevel } from '../../types';
import { sound } from '../../utils/audio';

interface StudentsTabProps {
  students: Student[];
  lessons: Lesson[];
  onStartLessonWithStudent: (lesson: Lesson, student: Student) => void;
  onUpdateStudents: (updated: Student[]) => void;
}

export const StudentsTab: React.FC<StudentsTabProps> = ({
  students,
  lessons,
  onStartLessonWithStudent,
  onUpdateStudents,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [level, setLevel] = useState<'A1' | 'A2' | 'B1' | 'B2' | 'C1'>('B1');
  const [balance, setBalance] = useState(8);
  const [notes, setNotes] = useState('');

  const handleAdjustBalance = (studentId: string, delta: number) => {
    sound.playClick();
    const updated = students.map((s) => {
      if (s.id === studentId) {
        return { ...s, lessonBalance: Math.max(0, s.lessonBalance + delta) };
      }
      return s;
    });
    onUpdateStudents(updated);
  };

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    sound.playCorrect();

    const newStudent: Student = {
      id: `student-${Date.now()}`,
      name: name.trim(),
      email: email.trim() || 'student@domain.com',
      level,
      lessonBalance: balance,
      totalLessonsCompleted: 0,
      notes: notes.trim(),
      homeworkStatus: 'none',
      currentLessonId: lessons[0]?.id,
    };

    onUpdateStudents([newStudent, ...students]);
    setName('');
    setEmail('');
    setNotes('');
    setShowAddModal(false);
  };

  return (
    <div>
      {/* Top Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
            Список учеников и баланс уроков
          </h2>
          <p style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>
            Управляйте занятиями, балансом оплаты и прогрессом каждого ученика (как в ProgressMe).
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <UserPlus size={16} />
          Добавить ученика
        </button>
      </div>

      {/* Students Cards / Table */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
        {students.map((student) => {
          const currentLesson = lessons.find((l) => l.id === student.currentLessonId) || lessons[0];

          return (
            <div
              key={student.id}
              className="app-card"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px 24px',
                borderRadius: 'var(--radius-md)',
                flexWrap: 'wrap',
                gap: '16px',
              }}
            >
              {/* Left Info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: '260px' }}>
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #4f46e5 0%, #818cf8 100%)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '17px',
                    boxShadow: '0 2px 6px rgba(79, 70, 229, 0.25)',
                  }}
                >
                  {student.name.charAt(0)}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 800, color: 'var(--text-main)' }}>
                      {student.name}
                    </span>
                    <span className="level-badge" style={{ fontSize: '11px', padding: '2px 8px' }}>
                      {student.level}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: 'var(--text-light)', marginTop: '2px' }}>
                    <Mail size={13} />
                    <span>{student.email}</span>
                  </div>
                </div>
              </div>

              {/* Middle Stats */}
              <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                {/* Lesson Balance Control */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-light)', fontWeight: 600, marginBottom: '4px' }}>
                    Баланс уроков
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={() => handleAdjustBalance(student.id, -1)}
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        border: '1px solid var(--border-subtle)',
                        background: 'var(--surface-subtle)',
                        cursor: 'pointer',
                        fontWeight: 800,
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      title="Списать 1 занятие"
                    >
                      -
                    </button>
                    <span
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '18px',
                        fontWeight: 800,
                        color: student.lessonBalance <= 1 ? 'var(--error)' : 'var(--text-main)',
                        minWidth: '24px',
                      }}
                    >
                      {student.lessonBalance}
                    </span>
                    <button
                      onClick={() => handleAdjustBalance(student.id, 1)}
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        border: '1px solid var(--border-subtle)',
                        background: 'var(--surface-subtle)',
                        cursor: 'pointer',
                        fontWeight: 800,
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      title="Добавить 1 занятие"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Completed Lessons */}
                <div style={{ textAlign: 'center', borderLeft: '1px solid var(--border-subtle)', paddingLeft: '20px' }}>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-light)', fontWeight: 600, marginBottom: '4px' }}>
                    Пройдено
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: 800, color: 'var(--text-main)' }}>
                    {student.totalLessonsCompleted} ур.
                  </div>
                </div>

                {/* Homework Status */}
                <div style={{ textAlign: 'center', borderLeft: '1px solid var(--border-subtle)', paddingLeft: '20px' }}>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-light)', fontWeight: 600, marginBottom: '4px' }}>
                    Статус ДЗ
                  </div>
                  {student.homeworkStatus === 'submitted' && (
                    <span style={{ fontSize: '12px', color: '#b45309', background: '#fef3c7', padding: '3px 8px', borderRadius: '12px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} />
                      На проверке
                    </span>
                  )}
                  {student.homeworkStatus === 'checked' && (
                    <span style={{ fontSize: '12px', color: '#15803d', background: '#dcfce7', padding: '3px 8px', borderRadius: '12px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={12} />
                      Проверено
                    </span>
                  )}
                  {student.homeworkStatus === 'assigned' && (
                    <span style={{ fontSize: '12px', color: '#4338ca', background: '#e0e7ff', padding: '3px 8px', borderRadius: '12px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <FileText size={12} />
                      Выполняет
                    </span>
                  )}
                  {(!student.homeworkStatus || student.homeworkStatus === 'none') && (
                    <span style={{ fontSize: '12px', color: 'var(--text-light)', background: 'var(--surface-subtle)', padding: '3px 8px', borderRadius: '12px' }}>
                      Не задано
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  className="btn btn-primary"
                  onClick={() => onStartLessonWithStudent(currentLesson, student)}
                  title="Войти в виртуальный класс с этим учеником"
                >
                  <Play size={15} />
                  Войти в класс
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              background: 'var(--surface-white)',
              borderRadius: 'var(--radius-lg)',
              width: '100%',
              maxWidth: '480px',
              padding: '28px 32px',
              boxShadow: 'var(--shadow-float)',
              position: 'relative',
            }}
          >
            <button
              onClick={() => setShowAddModal(false)}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)' }}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 800, marginBottom: '6px' }}>
              Добавить ученика
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Ученик появится в вашем списке, получит доступ к урокам и тренировке слов.
            </p>

            <form onSubmit={handleAddStudent} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                  Имя и фамилия
                </label>
                <input
                  type="text"
                  required
                  placeholder="напр. Дарья Петрова"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={modalInputStyle}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                  Email или Telegram
                </label>
                <input
                  type="text"
                  placeholder="daria@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={modalInputStyle}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                    Уровень (CEFR)
                  </label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value as CEFRLevel)}
                    style={modalInputStyle}
                  >
                    <option value="A1">A1 Beginner</option>
                    <option value="A2">A2 Elementary</option>
                    <option value="B1">B1 Intermediate</option>
                    <option value="B2">B2 Upper-Intermediate</option>
                    <option value="C1">C1 Advanced</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                    Оплачено занятий
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={balance}
                    onChange={(e) => setBalance(parseInt(e.target.value) || 0)}
                    style={modalInputStyle}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                  Заметки преподавателя
                </label>
                <textarea
                  placeholder="Цель обучения, слабые места в грамматике..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{ ...modalInputStyle, minHeight: '60px', resize: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1, justifyContent: 'center', padding: '11px 0' }}
                >
                  <Plus size={16} />
                  Создать профиль
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const modalInputStyle: React.CSSProperties = {
  width: '100%',
  padding: '9px 12px',
  borderRadius: 'var(--radius-sm)',
  border: '1.5px solid var(--border-subtle)',
  fontSize: '13.5px',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
};
