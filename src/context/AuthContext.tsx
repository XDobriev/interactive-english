import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserRole, AuthSession, AuthPermissions, TeacherProfile, StudentProfile } from '../types/auth';
import { getPermissionsForRole } from '../types/auth';

export const DEMO_TEACHER: TeacherProfile = {
  id: 't-anna',
  name: 'Анна Смирнова',
  email: 'anna.teacher@english-studio.io',
  role: 'teacher',
  credentials: 'CELTA / Cambridge C2 Proficiency',
  schoolName: 'English Studio Pro',
  studentsCount: 4,
  totalLessonsCreated: 5,
  plan: 'pro',
  createdAt: '2026-01-15T10:00:00Z',
};

export const DEMO_STUDENTS: StudentProfile[] = [
  {
    id: 'st-1',
    name: 'Анна Васильева',
    email: 'anna.v@example.com',
    role: 'student',
    level: 'B1',
    teacherId: 't-anna',
    teacherName: 'Анна Смирнова',
    lessonBalance: 6,
    completedLessonsCount: 8,
    createdAt: '2026-02-01T12:00:00Z',
    inviteCode: 'STU-B1-ANNA',
  },
  {
    id: 'st-2',
    name: 'Максим Петров',
    email: 'maxim.p@example.com',
    role: 'student',
    level: 'A2',
    teacherId: 't-anna',
    teacherName: 'Анна Смирнова',
    lessonBalance: 2,
    completedLessonsCount: 3,
    createdAt: '2026-03-10T15:30:00Z',
    inviteCode: 'STU-A2-MAX',
  },
  {
    id: 'st-3',
    name: 'Екатерина Соколова',
    email: 'kate.s@example.com',
    role: 'student',
    level: 'B2',
    teacherId: 't-anna',
    teacherName: 'Анна Смирнова',
    lessonBalance: 8,
    completedLessonsCount: 14,
    createdAt: '2026-01-20T09:15:00Z',
    inviteCode: 'STU-B2-KATE',
  },
  {
    id: 'st-4',
    name: 'Дмитрий Иванов',
    email: 'dmitry.i@example.com',
    role: 'student',
    level: 'A1',
    teacherId: 't-anna',
    teacherName: 'Анна Смирнова',
    lessonBalance: 4,
    completedLessonsCount: 1,
    createdAt: '2026-04-05T14:00:00Z',
    inviteCode: 'STU-A1-DMITRY',
  },
];

interface AuthContextType {
  user: User | null;
  session: AuthSession | null;
  role: UserRole;
  permissions: AuthPermissions;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginTeacher: (email?: string, name?: string) => Promise<void>;
  loginStudent: (studentIdOrName: string, inviteCode?: string) => Promise<void>;
  switchRole: (newRole: UserRole) => void;
  logout: () => void;
  activeStudent: StudentProfile | null;
  demoTeacher: TeacherProfile;
  demoStudents: StudentProfile[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'interactive_english_session_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(DEMO_TEACHER);
  const [session, setSession] = useState<AuthSession | null>(() => ({
    token: 'jwt-mock-teacher-token',
    user: DEMO_TEACHER,
    expiresAt: Date.now() + 86400000 * 7,
  }));
  const [isLoading, setIsLoading] = useState(false);

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: AuthSession = JSON.parse(stored);
        if (parsed.expiresAt > Date.now()) {
          setSession(parsed);
          setUser(parsed.user);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch {
      // Fallback to DEMO_TEACHER
    }
  }, []);

  const saveSession = (sess: AuthSession | null) => {
    setSession(sess);
    setUser(sess ? sess.user : null);
    if (sess) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sess));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const loginTeacher = async (email?: string, name?: string) => {
    setIsLoading(true);
    // Simulate brief network latency for realistic feel
    await new Promise((r) => setTimeout(r, 200));
    const teacherUser: TeacherProfile = {
      ...DEMO_TEACHER,
      email: email || DEMO_TEACHER.email,
      name: name || DEMO_TEACHER.name,
    };
    const newSession: AuthSession = {
      token: `jwt-mock-t-${Date.now()}`,
      user: teacherUser,
      expiresAt: Date.now() + 86400000 * 7,
    };
    saveSession(newSession);
    setIsLoading(false);
  };

  const loginStudent = async (studentIdOrName: string, _inviteCode?: string) => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 200));

    // Find student by ID or name
    const found =
      DEMO_STUDENTS.find((s) => s.id === studentIdOrName || s.name.toLowerCase().includes(studentIdOrName.toLowerCase())) ||
      DEMO_STUDENTS[0];

    const newSession: AuthSession = {
      token: `jwt-mock-s-${Date.now()}`,
      user: found,
      expiresAt: Date.now() + 86400000 * 7,
    };
    saveSession(newSession);
    setIsLoading(false);
  };

  const switchRole = (newRole: UserRole) => {
    if (newRole === 'teacher') {
      loginTeacher();
    } else {
      loginStudent(DEMO_STUDENTS[0].id);
    }
  };

  const logout = () => {
    saveSession(null);
  };

  const currentRole: UserRole = user ? user.role : 'teacher';
  const permissions = getPermissionsForRole(currentRole);

  const activeStudent: StudentProfile | null =
    user?.role === 'student' ? (user as StudentProfile) : DEMO_STUDENTS[0];

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        role: currentRole,
        permissions,
        isAuthenticated: !!user,
        isLoading,
        loginTeacher,
        loginStudent,
        switchRole,
        logout,
        activeStudent,
        demoTeacher: DEMO_TEACHER,
        demoStudents: DEMO_STUDENTS,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
