import type { CEFRLevel, UserRole } from './index';

export type { UserRole };

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  schoolName?: string;
  createdAt: string;
  phone?: string;
}

export interface TeacherProfile extends User {
  role: 'teacher';
  credentials?: string;
  studentsCount: number;
  totalLessonsCreated: number;
  plan: 'free' | 'pro' | 'academy';
}

export interface StudentProfile extends User {
  role: 'student';
  level: CEFRLevel;
  teacherId: string;
  teacherName: string;
  lessonBalance: number;
  completedLessonsCount: number;
  inviteCode?: string;
}

export interface AuthSession {
  token: string;
  user: User;
  expiresAt: number;
}

export interface AuthPermissions {
  canEditCurriculum: boolean;
  canViewTeacherNotes: boolean;
  canRevealAnswers: boolean;
  canGradeHomework: boolean;
  canManageStudents: boolean;
  canAccessAiGenerator: boolean;
  canManageSchedule: boolean;
  canConductClassroomAsTeacher: boolean;
}

export const getPermissionsForRole = (role: UserRole): AuthPermissions => {
  if (role === 'teacher') {
    return {
      canEditCurriculum: true,
      canViewTeacherNotes: true,
      canRevealAnswers: true,
      canGradeHomework: true,
      canManageStudents: true,
      canAccessAiGenerator: true,
      canManageSchedule: true,
      canConductClassroomAsTeacher: true,
    };
  }

  // Student permissions: strictly learner role
  return {
    canEditCurriculum: false,
    canViewTeacherNotes: false,
    canRevealAnswers: false,
    canGradeHomework: false,
    canManageStudents: false,
    canAccessAiGenerator: false,
    canManageSchedule: false,
    canConductClassroomAsTeacher: false,
  };
};
