import React, { useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Eye,
  EyeOff,
  CheckCircle,
  Timer,
  StickyNote,
  MessageSquare,
  Link2,
  Check,
  Sparkles,
} from 'lucide-react';
import type { CEFRLevel, UserRole } from '../../types';
import { sound } from '../../utils/audio';
import { useAuth } from '../../context/AuthContext';

interface ClassroomTopBarProps {
  lessonTitle: string;
  level: CEFRLevel;
  role: UserRole;
  onRoleChange: (newRole: UserRole) => void;
  showAnswers: boolean;
  onToggleShowAnswers: () => void;
  onBackToDashboard: () => void;
  onFinishLesson: () => void;
  studentName?: string;
  isTimerOpen: boolean;
  onToggleTimer: () => void;
  isWhiteboardOpen: boolean;
  onToggleWhiteboard: () => void;
  isChatOpen: boolean;
  onToggleChat: () => void;
  isAiAssistantOpen?: boolean;
  onToggleAiAssistant?: () => void;
  lessonId: string;
}

export const ClassroomTopBar: React.FC<ClassroomTopBarProps> = ({
  lessonTitle,
  level,
  role,
  onRoleChange,
  showAnswers,
  onToggleShowAnswers,
  onBackToDashboard,
  onFinishLesson,
  studentName = 'Анна',
  isTimerOpen,
  onToggleTimer,
  isWhiteboardOpen,
  onToggleWhiteboard,
  isChatOpen,
  onToggleChat,
  isAiAssistantOpen = false,
  onToggleAiAssistant,
  lessonId,
}) => {
  const { permissions } = useAuth();
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyStudentLink = () => {
    sound.playClick();
    const url = `${window.location.origin}${window.location.pathname}?lesson=${lessonId}&role=student`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).catch(() => {});
    }
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <header className="topbar classroom-topbar">
      <div className="topbar-left">
        <button
          onClick={onBackToDashboard}
          className="btn btn-secondary topbar-back-btn"
          title="Вернуться в кабинет преподавателя"
        >
          <ArrowLeft size={16} />
          <span className="back-btn-text">Кабинет</span>
        </button>

        <div className="lesson-meta-box">
          <span className="level-badge">{level}</span>
          <span className="lesson-name" title={lessonTitle}>
            {lessonTitle}
          </span>
        </div>

        {/* Presence Indicator */}
        <div className="presence-badge" title={`Ученик онлайн: ${studentName}`}>
          <span className="presence-dot"></span>
          <span className="presence-text">
            <span className="presence-prefix">Ученик: </span>
            <strong>{studentName}</strong>
          </span>
        </div>
      </div>

      <div className="topbar-right">
        {/* Classroom Tools Suite */}
        <div className="classroom-tools-pill">
          {/* Timer Toggle */}
          <button
            onClick={() => {
              sound.playClick();
              onToggleTimer();
            }}
            className={`classroom-tool-btn ${isTimerOpen ? 'active' : ''}`}
            title="Открыть таймер выполнения задания"
          >
            <Timer size={15} />
            <span className="tool-btn-text">Таймер</span>
          </button>

          {/* Whiteboard Toggle */}
          <button
            onClick={() => {
              sound.playClick();
              onToggleWhiteboard();
            }}
            className={`classroom-tool-btn ${isWhiteboardOpen ? 'active' : ''}`}
            title="Интерактивная доска со стикерами"
          >
            <StickyNote size={15} />
            <span className="tool-btn-text">Доска</span>
          </button>

          {/* Chat Toggle */}
          <button
            onClick={() => {
              sound.playClick();
              onToggleChat();
            }}
            className={`classroom-tool-btn ${isChatOpen ? 'active' : ''}`}
            title="Чат занятия"
          >
            <MessageSquare size={15} />
            <span className="tool-btn-text">Чат</span>
          </button>

          {/* Copy Student Link */}
          <button
            onClick={handleCopyStudentLink}
            className={`classroom-tool-btn ${copiedLink ? 'copied' : ''}`}
            title="Скопировать ссылку для отправки ученику"
          >
            {copiedLink ? <Check size={15} /> : <Link2 size={15} />}
            <span className="tool-btn-text">{copiedLink ? 'Скопировано!' : 'Ссылка'}</span>
          </button>
        </div>

        {/* Role Switcher */}
        <div className="segmented-control classroom-role-switch">
          <button
            className={`seg-button ${role === 'teacher' ? 'active' : ''}`}
            onClick={() => {
              if (!permissions.canConductClassroomAsTeacher) {
                alert('Доступ к подсказкам и ответам учителя ограничен. Авторизуйтесь под профилем преподавателя.');
                return;
              }
              onRoleChange('teacher');
            }}
            title={permissions.canConductClassroomAsTeacher ? 'Режим преподавателя (с подсказками и ответами)' : 'Доступно только преподавателю'}
          >
            <BookOpen size={14} />
            <span className="role-text-full">Преподаватель</span>
            <span className="role-text-short">Учитель</span>
          </button>
          <button
            className={`seg-button ${role === 'student' ? 'active' : ''}`}
            onClick={() => onRoleChange('student')}
            title="Режим студента"
          >
            <Eye size={14} />
            <span className="role-text-full">Вид ученика</span>
            <span className="role-text-short">Ученик</span>
          </button>
        </div>

        {/* Teacher Controls: AI Assistant & Reveal Answers */}
        {role === 'teacher' && (
          <div className="teacher-actions-group">
            {onToggleAiAssistant && (
              <button
                className={`btn btn-ai-assistant ${isAiAssistantOpen ? 'active' : ''}`}
                onClick={() => {
                  sound.playClick();
                  onToggleAiAssistant();
                }}
                title="ИИ-ассистент преподавателя (Gemini AI)"
              >
                <Sparkles size={15} />
                <span className="btn-label-full">AI Ассистент</span>
                <span className="btn-label-short">AI</span>
              </button>
            )}

            <button
              className="btn btn-teacher topbar-answers-btn"
              onClick={onToggleShowAnswers}
              title={showAnswers ? 'Скрыть правильные ответы' : 'Подсветить правильные ответы ученику'}
            >
              {showAnswers ? <EyeOff size={15} /> : <Eye size={15} />}
              <span className="btn-label-full">{showAnswers ? 'Скрыть ответы' : 'Показать ответы'}</span>
              <span className="btn-label-short">{showAnswers ? 'Скрыть' : 'Ответы'}</span>
            </button>
          </div>
        )}

        <button className="btn btn-primary topbar-finish-btn" onClick={onFinishLesson} title="Завершить занятие">
          <CheckCircle size={15} />
          <span className="finish-text-full">Завершить урок</span>
          <span className="finish-text-short">Завершить</span>
        </button>
      </div>
    </header>
  );
};

