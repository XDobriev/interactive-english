import React, { useState } from 'react';
import {
  Plus,
  Sparkles,
  Users,
  Calendar,
  FileCheck,
  BookOpen,
} from 'lucide-react';
import type { Lesson, Student, ScheduleEvent, HomeworkSubmission } from '../../types';
import { StudentsTab } from './StudentsTab';
import { ScheduleTab } from './ScheduleTab';
import { HomeworkTab } from './HomeworkTab';
import { LessonsCatalogTab } from './LessonsCatalogTab';
import { AiLessonModal } from './AiLessonModal';
import { UserAccountMenu } from '../auth/UserAccountMenu';
import { LoginModal } from '../auth/LoginModal';
import { sound } from '../../utils/audio';

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
  const [showAiLessonModal, setShowAiLessonModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const pendingHomeworkCount = homeworkSubmissions.filter((h) => h.status === 'pending_review').length;

  const handleLessonGenerated = (newLesson: Lesson) => {
    onEditLesson(newLesson);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Navigation Bar */}
      <header className="topbar dashboard-topbar">
        {/* Brand */}
        <div className="dashboard-brand-left">
          <div className="brand-logo">
            <div className="brand-icon">EN</div>
            <div className="brand-name">
              ProgressMe <span className="brand-subname">English Studio</span>
            </div>
          </div>
        </div>

        {/* Center Nav Tabs */}
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

        {/* Topbar Actions + User Account */}
        <div className="dashboard-topbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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

          {/* User Account & Role Switcher */}
          <UserAccountMenu onOpenLoginModal={() => setShowLoginModal(true)} />
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
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginBottom: '12px',
              }}
            >
              <Sparkles size={13} />
              ProgressMe Alternative • English Platform
            </div>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(20px, 3vw, 26px)',
                fontWeight: 800,
                marginBottom: '8px',
                letterSpacing: '-0.02em',
              }}
            >
              Интерактивная студия онлайн–преподавания
            </h1>
            <p style={{ opacity: 0.85, fontSize: '13.5px', maxWidth: '640px', lineHeight: 1.5 }}>
              Виртуальный класс в реальном времени, 6 видов интерактивных заданий, встроенный словарь,
              расписание и домашние задания с автоматической проверкой.
            </p>
          </div>

          <div className="dashboard-hero-stats" style={{ display: 'flex', gap: '14px' }}>
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                padding: '12px 20px',
                borderRadius: '14px',
                textAlign: 'center',
                minWidth: '90px',
              }}
            >
              <div style={{ fontSize: '24px', fontWeight: 800 }}>{lessons.length}</div>
              <div style={{ fontSize: '11px', opacity: 0.8 }}>Готовых уроков</div>
            </div>

            <div
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                padding: '12px 20px',
                borderRadius: '14px',
                textAlign: 'center',
                minWidth: '90px',
              }}
            >
              <div style={{ fontSize: '24px', fontWeight: 800 }}>{students.length}</div>
              <div style={{ fontSize: '11px', opacity: 0.8 }}>Учеников</div>
            </div>
          </div>
        </div>

        {/* Active Tab Content */}
        {activeTab === 'lessons' && (
          <LessonsCatalogTab
            lessons={lessons}
            onStartLesson={onStartLesson}
            onEditLesson={onEditLesson}
            onDuplicateLesson={onDuplicateLesson}
            onDeleteLesson={onDeleteLesson}
          />
        )}

        {activeTab === 'students' && (
          <StudentsTab
            students={students}
            lessons={lessons}
            onUpdateStudents={onUpdateStudents}
            onStartLessonWithStudent={(lesson, student) => {
              onStartLesson(lesson, 'teacher', student.name);
            }}
          />
        )}

        {activeTab === 'schedule' && (
          <ScheduleTab
            events={scheduleEvents}
            students={students}
            lessons={lessons}
            onUpdateEvents={onUpdateScheduleEvents}
            onStartLesson={(lesson, studentName) => {
              onStartLesson(lesson, 'teacher', studentName);
            }}
          />
        )}

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

      {/* AI Lesson Generation Modal */}
      <AiLessonModal
        isOpen={showAiLessonModal}
        onClose={() => setShowAiLessonModal(false)}
        onLessonGenerated={handleLessonGenerated}
      />

      {/* Login / Switch Account Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />

    </div>
  );
};
