import React, { useState, useEffect } from 'react';
import { initialCurriculum } from './data/initialCurriculum';
import { initialStudents, initialScheduleEvents, initialHomeworkSubmissions } from './data/mockData';
import type { Lesson, UserRole, Student, ScheduleEvent, HomeworkSubmission } from './types';
import { TeacherDashboard } from './components/dashboard/TeacherDashboard';
import { ClassroomRunner } from './components/classroom/ClassroomRunner';
import { LessonBuilder } from './components/builder/LessonBuilder';
import { AuthProvider, useAuth } from './context/AuthContext';
import { sound } from './utils/audio';

type AppView = 'dashboard' | 'classroom' | 'builder';

const STORAGE_LESSONS = 'interactive_english_lessons_v2';
const STORAGE_STUDENTS = 'interactive_english_students_v2';
const STORAGE_SCHEDULE = 'interactive_english_schedule_v2';
const STORAGE_HOMEWORK = 'interactive_english_homework_v2';

const AppContent: React.FC = () => {
  const { role, user, permissions } = useAuth();

  const [lessons, setLessons] = useState<Lesson[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_LESSONS);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Failed to parse saved lessons:', e);
        }
      }
    }
    return initialCurriculum;
  });

  const [students, setStudents] = useState<Student[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_STUDENTS);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
    }
    return initialStudents;
  });

  const [scheduleEvents, setScheduleEvents] = useState<ScheduleEvent[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_SCHEDULE);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
    }
    return initialScheduleEvents;
  });

  const [homeworkSubmissions, setHomeworkSubmissions] = useState<HomeworkSubmission[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_HOMEWORK);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
    }
    return initialHomeworkSubmissions;
  });

  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [activeRole, setActiveRole] = useState<UserRole>(role);
  const [activeStudentName, setActiveStudentName] = useState<string>('Анна');
  const [editingLesson, setEditingLesson] = useState<Lesson | undefined>(undefined);

  // Sync active role with auth role
  useEffect(() => {
    setActiveRole(role);
    if (user?.role === 'student') {
      setActiveStudentName(user.name);
    }
  }, [role, user]);

  // Check URL query parameters for direct student links: ?lesson=unit-b1-travel&role=student
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const lessonParam = params.get('lesson');
    const roleParam = params.get('role');

    if (lessonParam) {
      const found = lessons.find((l) => l.id === lessonParam);
      if (found) {
        setActiveLesson(found);
        const resolvedRole = roleParam === 'student' ? 'student' : role;
        setActiveRole(resolvedRole);
        setCurrentView('classroom');
      }
    }
  }, [lessons, role]);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_LESSONS, JSON.stringify(lessons));
    } catch (e) {}
  }, [lessons]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_STUDENTS, JSON.stringify(students));
    } catch (e) {}
  }, [students]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SCHEDULE, JSON.stringify(scheduleEvents));
    } catch (e) {}
  }, [scheduleEvents]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_HOMEWORK, JSON.stringify(homeworkSubmissions));
    } catch (e) {}
  }, [homeworkSubmissions]);

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
