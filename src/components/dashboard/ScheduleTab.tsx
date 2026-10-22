import React, { useState } from 'react';
import { Plus, Play, User, BookOpen, X } from 'lucide-react';
import type { ScheduleEvent, Student, Lesson } from '../../types';
import { sound } from '../../utils/audio';

interface ScheduleTabProps {
  events: ScheduleEvent[];
  students: Student[];
  lessons: Lesson[];
  onStartLesson: (lesson: Lesson, studentName: string) => void;
  onUpdateEvents: (updated: ScheduleEvent[]) => void;
}

export const ScheduleTab: React.FC<ScheduleTabProps> = ({
  events,
  students,
  lessons,
  onStartLesson,
  onUpdateEvents,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || '');
  const [selectedLessonId, setSelectedLessonId] = useState(lessons[0]?.id || '');
  const [dayOfWeek, setDayOfWeek] = useState('Пн');
  const [time, setTime] = useState('14:00 - 15:00');
  const [dateStr, setDateStr] = useState('2026-10-24');

  const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const st = students.find((s) => s.id === selectedStudentId);
    const ls = lessons.find((l) => l.id === selectedLessonId);
    if (!st || !ls) return;

    sound.playCorrect();
    const newEv: ScheduleEvent = {
      id: `sched-${Date.now()}`,
      studentId: st.id,
      studentName: st.name,
      lessonId: ls.id,
      lessonTitle: ls.title,
      dayOfWeek,
      time,
      status: 'upcoming',
      dateStr,
    };

    onUpdateEvents([...events, newEv]);
    setShowAddModal(false);
  };

  return (
    <div>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
            Расписание занятий
          </h2>
          <p style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>
            Планируйте онлайн-уроки с учениками. Запланированные слоты открываются в 1 клик.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={16} />
          Запланировать урок
        </button>
      </div>

      {/* Week Days Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px', marginBottom: '28px' }}>
        {days.map((day) => {
          const dayEvents = events.filter((e) => e.dayOfWeek === day);
          const hasUpcoming = dayEvents.some((e) => e.status === 'upcoming');

          return (
            <div
              key={day}
              style={{
                background: hasUpcoming ? 'var(--primary-subtle)' : 'var(--surface-white)',
                border: hasUpcoming ? '1.5px solid var(--primary)' : '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 10px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 800, color: hasUpcoming ? 'var(--primary)' : 'var(--text-light)', textTransform: 'uppercase' }}>
                {day}
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
                {dayEvents.length} {dayEvents.length === 1 ? 'урок' : 'уроков'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Events List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {events.map((ev) => {
          const targetLesson = lessons.find((l) => l.id === ev.lessonId) || lessons[0];

          return (
            <div
              key={ev.id}
              className="app-card"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '18px 24px',
                borderRadius: 'var(--radius-md)',
                flexWrap: 'wrap',
                gap: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                {/* Time Badge */}
                <div
                  style={{
                    background: ev.status === 'completed' ? 'var(--surface-subtle)' : 'var(--primary-subtle)',
                    color: ev.status === 'completed' ? 'var(--text-muted)' : 'var(--primary)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '8px 14px',
                    textAlign: 'center',
                    minWidth: '100px',
                  }}
                >
                  <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>
                    {ev.dayOfWeek} • {ev.dateStr}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13.5px', fontWeight: 800, marginTop: '2px' }}>
                    {ev.time}
                  </div>
                </div>

                {/* Details */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <User size={15} color="var(--primary)" />
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 800, color: 'var(--text-main)' }}>
                      {ev.studentName}
                    </span>
                    {ev.status === 'completed' ? (
                      <span style={{ fontSize: '11px', background: 'var(--surface-subtle)', color: 'var(--text-muted)', padding: '2px 8px', borderRadius: '10px' }}>
                        Проведён
                      </span>
                    ) : (
                      <span style={{ fontSize: '11px', background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
                        Предстоящий
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>
                    <BookOpen size={14} />
                    <span>{ev.lessonTitle}</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                className="btn btn-primary"
                onClick={() => onStartLesson(targetLesson, ev.studentName)}
                title="Войти в виртуальный класс"
              >
                <Play size={15} />
                Войти в класс
              </button>
            </div>
          );
        })}
      </div>

      {/* Schedule Modal */}
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
              maxWidth: '460px',
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
              Запланировать занятие
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Выберите ученика, учебный материал и удобное время.
            </p>

            <form onSubmit={handleAddEvent} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                  Ученик
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  style={modalInputStyle}
                >
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} ({st.level}, баланс: {st.lessonBalance} ур.)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                  Тема урока
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                    День недели
                  </label>
                  <select
                    value={dayOfWeek}
                    onChange={(e) => setDayOfWeek(e.target.value)}
                    style={modalInputStyle}
                  >
                    {days.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                    Время (интервал)
                  </label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    style={modalInputStyle}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                  Дата занятия (ГГГГ-ММ-ДД)
                </label>
                <input
                  type="date"
                  value={dateStr}
                  onChange={(e) => setDateStr(e.target.value)}
                  style={modalInputStyle}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1, justifyContent: 'center', padding: '11px 0' }}
                >
                  <Plus size={16} />
                  Добавить в расписание
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
