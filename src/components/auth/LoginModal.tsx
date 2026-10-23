import React, { useState } from 'react';
import { X, GraduationCap, UserCheck, ShieldCheck, Mail, Lock, ArrowRight, KeyRound, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { sound } from '../../utils/audio';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { loginTeacher, loginStudent, demoTeacher, demoStudents } = useAuth();
  const [activeTab, setActiveTab] = useState<'teacher' | 'student'>('teacher');
  const [teacherEmail, setTeacherEmail] = useState('anna.teacher@english-studio.io');
  const [teacherPassword, setTeacherPassword] = useState('••••••••');
  const [selectedStudentId, setSelectedStudentId] = useState(demoStudents[0]?.id || 'st-1');
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleTeacherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    setIsSubmitting(true);
    await loginTeacher(teacherEmail, demoTeacher.name);
    setIsSubmitting(false);
    sound.playCorrect();
    onClose();
  };

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    setIsSubmitting(true);
    await loginStudent(selectedStudentId, inviteCodeInput);
    setIsSubmitting(false);
    sound.playCorrect();
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        className="app-card animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '520px',
          padding: '32px',
          position: 'relative',
          borderRadius: '24px',
          boxShadow: 'var(--shadow-float)',
        }}
      >
        {/* Close Button */}
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'var(--surface-subtle)',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            transition: 'all 0.15s',
          }}
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px',
              boxShadow: '0 8px 20px rgba(79, 70, 229, 0.3)',
            }}
          >
            <ShieldCheck size={28} />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>
            Авторизация в English Studio
          </h2>
          <p style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>
            Разграничение прав преподавателя и ученика (RBAC)
          </p>
        </div>

        {/* Role Tabs */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '6px',
            background: 'var(--surface-subtle)',
            padding: '4px',
            borderRadius: '14px',
            marginBottom: '24px',
          }}
        >
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('teacher');
            }}
            style={{
              padding: '10px 14px',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'teacher' ? 'var(--surface-white)' : 'transparent',
              color: activeTab === 'teacher' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '13.5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: activeTab === 'teacher' ? 'var(--shadow-subtle)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <GraduationCap size={16} />
            Преподаватель
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('student');
            }}
            style={{
              padding: '10px 14px',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'student' ? 'var(--surface-white)' : 'transparent',
              color: activeTab === 'student' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '13.5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: activeTab === 'student' ? 'var(--shadow-subtle)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <UserCheck size={16} />
            Кабинет ученика
          </button>
        </div>

        {/* Tab 1: Teacher Login */}
        {activeTab === 'teacher' ? (
          <form onSubmit={handleTeacherSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Email преподавателя
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '14px', top: '13px', color: 'var(--text-light)' }} />
                  <input
                    type="email"
                    value={teacherEmail}
                    onChange={(e) => setTeacherEmail(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '11px 14px 11px 40px',
                      borderRadius: '10px',
                      border: '1.5px solid var(--border-subtle)',
                      background: 'var(--surface-white)',
                      fontSize: '14px',
                      color: 'var(--text-main)',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Пароль
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '14px', top: '13px', color: 'var(--text-light)' }} />
                  <input
                    type="password"
                    value={teacherPassword}
                    onChange={(e) => setTeacherPassword(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '11px 14px 11px 40px',
                      borderRadius: '10px',
                      border: '1.5px solid var(--border-subtle)',
                      background: 'var(--surface-white)',
                      fontSize: '14px',
                      color: 'var(--text-main)',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              {/* Demo Quick Notice */}
              <div
                style={{
                  background: 'var(--primary-subtle)',
                  border: '1px solid var(--primary-border)',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  fontSize: '12px',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Sparkles size={16} />
                <span>Демо-режим: доступ ко всем функциям учителя и ИИ-генерации активен</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '13px',
                fontSize: '14.5px',
                fontWeight: 700,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <span>{isSubmitting ? 'Вход...' : 'Войти как преподаватель'}</span>
              <ArrowRight size={16} />
            </button>
          </form>
        ) : (
          /* Tab 2: Student Login */
          <form onSubmit={handleStudentSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Выберите профиль ученика
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {demoStudents.map((st) => (
                    <div
                      key={st.id}
                      onClick={() => {
                        sound.playClick();
                        setSelectedStudentId(st.id);
                      }}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: selectedStudentId === st.id ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                        background: selectedStudentId === st.id ? 'var(--primary-subtle)' : 'var(--surface-white)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: '#e0e7ff',
                            color: '#4338ca',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '13px',
                          }}
                        >
                          {st.name[0]}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '13.5px', color: 'var(--text-main)' }}>{st.name}</div>
                          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Уровень {st.level} • Баланс: {st.lessonBalance} уроков</div>
                        </div>
                      </div>
                      <span className="level-badge">{st.level}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Или введите инвайт-код урока
                </label>
                <div style={{ position: 'relative' }}>
                  <KeyRound size={16} style={{ position: 'absolute', left: '14px', top: '13px', color: 'var(--text-light)' }} />
                  <input
                    type="text"
                    placeholder="Например: STU-B1-ANNA"
                    value={inviteCodeInput}
                    onChange={(e) => setInviteCodeInput(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '11px 14px 11px 40px',
                      borderRadius: '10px',
                      border: '1.5px solid var(--border-subtle)',
                      background: 'var(--surface-white)',
                      fontSize: '14px',
                      color: 'var(--text-main)',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '13px',
                fontSize: '14.5px',
                fontWeight: 700,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <span>{isSubmitting ? 'Вход...' : 'Войти в кабинет ученика'}</span>
              <ArrowRight size={16} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
