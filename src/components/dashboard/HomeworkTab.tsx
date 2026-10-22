import React, { useState } from 'react';
import { FileCheck, Plus, MessageSquare, Send, BookOpen, X } from 'lucide-react';
import type { HomeworkSubmission, Student, Lesson } from '../../types';
import { sound } from '../../utils/audio';

interface HomeworkTabProps {
  submissions: HomeworkSubmission[];
  students: Student[];
  lessons: Lesson[];
  onUpdateSubmissions: (updated: HomeworkSubmission[]) => void;
  onAssignHomework: (studentId: string, lessonId: string) => void;
}

export const HomeworkTab: React.FC<HomeworkTabProps> = ({
  submissions,
  students,
  lessons,
  onUpdateSubmissions,
  onAssignHomework,
}) => {
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || '');
  const [selectedLessonId, setSelectedLessonId] = useState(lessons[0]?.id || '');
  const [reviewingHwId, setReviewingHwId] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState('');

  const handleSaveFeedback = (submissionId: string) => {
    if (!feedbackText.trim()) return;
    sound.playCorrect();

    const updated = submissions.map((sub) => {
      if (sub.id === submissionId) {
        return {
          ...sub,
          teacherFeedback: feedbackText.trim(),
          status: 'reviewed' as const,
        };
      }
      return sub;
    });

    onUpdateSubmissions(updated);
    setReviewingHwId(null);
    setFeedbackText('');
  };

  const handleConfirmAssign = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playCorrect();
    onAssignHomework(selectedStudentId, selectedLessonId);
    setShowAssignModal(false);
  };

  return (
    <div>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
            Домашние задания и автопроверка
          </h2>
          <p style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>
            Отслеживайте выполненные учениками работы с автоматическим подсчетом баллов.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setShowAssignModal(true)}>
          <Plus size={16} />
          Назначить домашнее задание
        </button>
      </div>

      {/* Submissions List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {submissions.map((sub) => {
          const isReviewing = reviewingHwId === sub.id;

          return (
            <div
              key={sub.id}
              className="app-card"
              style={{
                borderRadius: 'var(--radius-md)',
                padding: '20px 24px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 800, color: 'var(--text-main)' }}>
                      {sub.studentName}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--text-light)' }}>
                      Сдано: {sub.submittedAt}
                    </span>
                    {sub.status === 'pending_review' ? (
                      <span style={{ fontSize: '11.5px', background: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
                        Ожидает отзыва
                      </span>
                    ) : (
                      <span style={{ fontSize: '11.5px', background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
                        Проверено учителем
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13.5px', color: 'var(--text-muted)' }}>
                    <BookOpen size={14} />
                    <span>Урок: <strong>{sub.lessonTitle}</strong></span>
                  </div>
                </div>

                {/* Score Pill */}
                <div style={{ textAlign: 'right' }}>
                  <div
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '24px',
                      fontWeight: 800,
                      color: sub.scorePercent >= 90 ? 'var(--success)' : 'var(--warning)',
                    }}
                  >
                    {sub.scorePercent}%
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-light)', fontWeight: 600 }}>
                    Результат автопроверки
                  </div>
                </div>
              </div>

              {/* Exercises summary */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '8px',
                  marginTop: '14px',
                  marginBottom: '14px',
                }}
              >
                {sub.exerciseResults.map((ex, exIdx) => (
                  <div
                    key={exIdx}
                    style={{
                      background: 'var(--surface-subtle)',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      fontSize: '12.5px',
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span style={{ color: 'var(--text-muted)' }}>{ex.exerciseTitle}</span>
                    <strong style={{ color: ex.score === ex.maxScore ? 'var(--success)' : 'var(--text-main)' }}>
                      {ex.score}/{ex.maxScore}
                    </strong>
                  </div>
                ))}
              </div>

              {/* Student Comment */}
              {sub.studentComment && (
                <div
                  style={{
                    background: '#f8fafc',
                    borderLeft: '3px solid var(--primary)',
                    padding: '8px 14px',
                    borderRadius: '0 6px 6px 0',
                    fontSize: '13px',
                    color: 'var(--text-main)',
                    marginBottom: '14px',
                  }}
                >
                  <span style={{ fontWeight: 700, color: 'var(--primary)' }}>Комментарий ученика: </span>
                  "{sub.studentComment}"
                </div>
              )}

              {/* Teacher Feedback Section */}
              {sub.teacherFeedback ? (
                <div
                  style={{
                    background: 'var(--primary-subtle)',
                    border: '1px solid var(--primary-border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '12px 16px',
                    fontSize: '13.5px',
                    color: 'var(--text-main)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, color: 'var(--primary)', marginBottom: '4px', fontSize: '12px' }}>
                    <MessageSquare size={14} />
                    Ваш отзыв преподавателя:
                  </div>
                  <div>{sub.teacherFeedback}</div>
                </div>
              ) : isReviewing ? (
                <div style={{ marginTop: '12px' }}>
                  <textarea
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Напишите похвалу или разберите сложный момент для ученика..."
                    style={{
                      width: '100%',
                      minHeight: '70px',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1.5px solid var(--border-subtle)',
                      fontFamily: 'inherit',
                      fontSize: '13.5px',
                      resize: 'none',
                      boxSizing: 'border-box',
                      marginBottom: '8px',
                    }}
                  />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleSaveFeedback(sub.id)}
                      disabled={!feedbackText.trim()}
                    >
                      <Send size={14} />
                      Отправить отзыв ученику
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => setReviewingHwId(null)}
                    >
                      Отмена
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  className="btn btn-secondary"
                  style={{ padding: '6px 14px', fontSize: '13px' }}
                  onClick={() => {
                    sound.playClick();
                    setReviewingHwId(sub.id);
                  }}
                >
                  <MessageSquare size={14} />
                  Оставить отзыв преподавателя
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Assign Homework Modal */}
      {showAssignModal && (
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
              maxWidth: '460px',
              padding: '28px 32px',
              boxShadow: 'var(--shadow-float)',
              position: 'relative',
            }}
          >
            <button
              onClick={() => setShowAssignModal(false)}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)' }}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 800, marginBottom: '6px' }}>
              Назначить домашнее задание
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Ученик сможет пройти выбранный урок дома, а система проверит ответы автоматически.
            </p>

            <form onSubmit={handleConfirmAssign} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                  Кому назначить
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  style={modalInputStyle}
                >
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} ({st.level})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                  Учебный материал / Юнит
                </label>
                <select
                  value={selectedLessonId}
                  onChange={(e) => setSelectedLessonId(e.target.value)}
                  style={modalInputStyle}
                >
                  {lessons.map((ls) => (
                    <option key={ls.id} value={ls.id}>
                      [{ls.level}] {ls.title}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1, justifyContent: 'center', padding: '11px 0' }}
                >
                  <FileCheck size={16} />
                  Назначить задание
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAssignModal(false)}
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
