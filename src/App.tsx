import React, { useState, useEffect } from 'react';
import { initialCurriculum } from './data/initialCurriculum';
import { initialStudents, initialScheduleEvents, initialHomeworkSubmissions } from './data/mockData';
import type { Lesson, UserRole, Student, ScheduleEvent, HomeworkSubmission } from './types';
import { TeacherDashboard } from './components/dashboard/TeacherDashboard';
import { ClassroomRunner } from './components/classroom/ClassroomRunner';
import { LessonBuilder } from './components/builder/LessonBuilder';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/authCore';
import { sound } from './utils/audio';
import { loadJson, saveJson } from './utils/storage';

type AppView = 'dashboard' | 'classroom' | 'builder';

const STORAGE_LESSONS = 'interactive_english_lessons_v2';
const STORAGE_STUDENTS = 'interactive_english_students_v2';
const STORAGE_SCHEDULE = 'interactive_english_schedule_v2';
const STORAGE_HOMEWORK = 'interactive_english_homework_v2';

const AppContent: React.FC = () => {
  const { role, user, permissions } = useAuth();

  const [lessons, setLessons] = useState<Lesson[]>(() => loadJson(STORAGE_LESSONS, initialCurriculum));
  const [students, setStudents] = useState<Student[]>(() => loadJson(STORAGE_STUDENTS, initialStudents));
  const [scheduleEvents, setScheduleEvents] = useState<ScheduleEvent[]>(() =>
    loadJson(STORAGE_SCHEDULE, initialScheduleEvents)
  );
  const [homeworkSubmissions, setHomeworkSubmissions] = useState<HomeworkSubmission[]>(() =>
    loadJson(STORAGE_HOMEWORK, initialHomeworkSubmissions)
  );

  // Direct student links open the classroom immediately: ?lesson=unit-b1-travel&role=student
  const [launch] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const lessonId = params.get('lesson');
    const lesson = lessonId ? lessons.find((l) => l.id === lessonId) : undefined;
    return lesson ? { lesson, role: params.get('role') === 'student' ? ('student' as const) : role } : null;
  });

  const [currentView, setCurrentView] = useState<AppView>(launch ? 'classroom' : 'dashboard');
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(launch?.lesson ?? null);
  const [activeRole, setActiveRole] = useState<UserRole>(launch?.role ?? role);
  const [activeStudentName, setActiveStudentName] = useState<string>('Анна');
  const [editingLesson, setEditingLesson] = useState<Lesson | undefined>(undefined);

  // Follow auth changes (login/logout/role switch) without an effect: adjust state while rendering
  const [syncedUser, setSyncedUser] = useState(user);
  if (syncedUser !== user) {
    setSyncedUser(user);
    setActiveRole(role);
    if (user?.role === 'student') {
      setActiveStudentName(user.name);
    }
  }

  // Persist data to local storage
  useEffect(() => saveJson(STORAGE_LESSONS, lessons), [lessons]);
  useEffect(() => saveJson(STORAGE_STUDENTS, students), [students]);
  useEffect(() => saveJson(STORAGE_SCHEDULE, scheduleEvents), [scheduleEvents]);
  useEffect(() => saveJson(STORAGE_HOMEWORK, homeworkSubmissions), [homeworkSubmissions]);

  const handleStartLesson = (lesson: Lesson, targetRole: UserRole, studentName?: string) => {
    sound.playClick();
    setActiveLesson(lesson);
    setActiveRole(targetRole);
    if (studentName) {
      setActiveStudentName(studentName);
    } else if (user?.role === 'student') {
      setActiveStudentName(user.name);
    }
    setCurrentView('classroom');
  };

  const handleEditLesson = (lesson: Lesson) => {
    if (!permissions.canEditCurriculum) {
      alert('У вас нет прав преподавателя на редактирование уроков. Переключитесь на аккаунт преподавателя.');
      return;
    }
    sound.playClick();
    setEditingLesson(lesson);
    setCurrentView('builder');
  };

  const handleCreateLesson = () => {
    if (!permissions.canEditCurriculum) {
      alert('У вас нет прав преподавателя на создание уроков. Переключитесь на аккаунт преподавателя.');
      return;
    }
    sound.playClick();
    setEditingLesson(undefined);
    setCurrentView('builder');
  };

  const handleSaveLesson = (savedLesson: Lesson) => {
    const exists = lessons.some((l) => l.id === savedLesson.id);
    let updated: Lesson[];
    if (exists) {
      updated = lessons.map((l) => (l.id === savedLesson.id ? savedLesson : l));
    } else {
      updated = [savedLesson, ...lessons];
    }
    setLessons(updated);
    setCurrentView('dashboard');
  };

  const handleDuplicateLesson = (lesson: Lesson) => {
    if (!permissions.canEditCurriculum) return;
    sound.playClick();
    const copy: Lesson = {
      ...lesson,
      id: `copy-${Date.now()}`,
      title: `${lesson.title} (Копия)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setLessons([copy, ...lessons]);
  };

  const handleDeleteLesson = (lessonId: string) => {
    if (!permissions.canEditCurriculum) return;
    sound.playClick();
    setLessons(lessons.filter((l) => l.id !== lessonId));
  };

  const handleUpdateActiveLesson = (updatedLesson: Lesson) => {
    setActiveLesson(updatedLesson);
    setLessons(lessons.map((l) => (l.id === updatedLesson.id ? updatedLesson : l)));
  };

  const handleAssignHomework = (studentId: string, lessonId: string) => {
    if (!permissions.canGradeHomework) return;
    const targetStudent = students.find((s) => s.id === studentId);
    const targetLesson = lessons.find((l) => l.id === lessonId);
    if (!targetStudent || !targetLesson) return;

    const updatedStudents = students.map((s) => {
      if (s.id === studentId) {
        return { ...s, homeworkStatus: 'assigned' as const, currentLessonId: lessonId };
      }
      return s;
    });
    setStudents(updatedStudents);

    alert(`✓ Домашнее задание по уроку "${targetLesson.title}" назначено ученику ${targetStudent.name}!`);
  };

  return (
    <div>
      {currentView === 'dashboard' && (
        <TeacherDashboard
          lessons={lessons}
          students={students}
          scheduleEvents={scheduleEvents}
          homeworkSubmissions={homeworkSubmissions}
          onStartLesson={handleStartLesson}
          onEditLesson={handleEditLesson}
          onCreateLesson={handleCreateLesson}
          onDuplicateLesson={handleDuplicateLesson}
          onDeleteLesson={handleDeleteLesson}
          onUpdateStudents={setStudents}
          onUpdateScheduleEvents={setScheduleEvents}
          onUpdateHomeworkSubmissions={setHomeworkSubmissions}
          onAssignHomework={handleAssignHomework}
        />
      )}

      {currentView === 'classroom' && activeLesson && (
        <ClassroomRunner
          lesson={activeLesson}
          initialRole={activeRole}
          studentName={activeStudentName}
          onBackToDashboard={() => {
            sound.playClick();
            if (typeof window !== 'undefined' && window.history.replaceState) {
              window.history.replaceState({}, '', window.location.pathname);
            }
            setCurrentView('dashboard');
          }}
          onUpdateLesson={handleUpdateActiveLesson}
        />
      )}

      {currentView === 'builder' && (
        <LessonBuilder
          initialLesson={editingLesson}
          onSave={handleSaveLesson}
          onCancel={() => {
            sound.playClick();
            setCurrentView('dashboard');
          }}
        />
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
