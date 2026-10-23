import React, { useState } from 'react';
import type { AuthSession, UserRole, StudentProfile } from '../types/auth';
import { getPermissionsForRole } from '../types/auth';
import { loadJson } from '../utils/storage';
import { DEMO_TEACHER, DEMO_STUDENTS } from './demoData';
import { AuthContext } from './authCore';

const STORAGE_KEY = 'interactive_english_session_v1';
const SESSION_TTL_MS = 86_400_000 * 7;
const DEMO_LATENCY_MS = 200;

// Demo mode: sessions are created locally and are NOT a security boundary.
const createDemoSession = (user: AuthSession['user'], kind: 'teacher' | 'student'): AuthSession => ({
  token: `demo-${kind}-${Date.now()}`,
  user,
  expiresAt: Date.now() + SESSION_TTL_MS,
});

const restoreSession = (): AuthSession => {
  const stored = loadJson<AuthSession | null>(STORAGE_KEY, null);
  if (stored && stored.expiresAt > Date.now()) return stored;
  if (stored) localStorage.removeItem(STORAGE_KEY);
  return createDemoSession(DEMO_TEACHER, 'teacher');
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<AuthSession | null>(restoreSession);
  const [isLoading, setIsLoading] = useState(false);
  const user = session?.user ?? null;

  const saveSession = (next: AuthSession | null) => {
    setSession(next);
    try {
      if (next) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (err) {
      console.warn('Failed to persist session:', err);
    }
  };

  const simulateLatency = () => new Promise((resolve) => setTimeout(resolve, DEMO_LATENCY_MS));

  const loginTeacher = async (email?: string, name?: string) => {
    setIsLoading(true);
    try {
      await simulateLatency();
      saveSession(
        createDemoSession(
          { ...DEMO_TEACHER, email: email || DEMO_TEACHER.email, name: name || DEMO_TEACHER.name },
          'teacher'
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const loginStudent = async (studentIdOrName: string, inviteCode?: string) => {
    setIsLoading(true);
    try {
      await simulateLatency();
      const query = studentIdOrName.trim().toLowerCase();
      const found = DEMO_STUDENTS.find((s) => s.id === studentIdOrName || s.name.toLowerCase().includes(query));
      if (!found) {
        throw new Error('Ученик не найден.');
      }
      const code = inviteCode?.trim();
      if (code && found.inviteCode?.toLowerCase() !== code.toLowerCase()) {
        throw new Error('Неверный код приглашения.');
      }
      saveSession(createDemoSession(found, 'student'));
    } finally {
      setIsLoading(false);
    }
  };

  const switchRole = (newRole: UserRole) => {
    const login = newRole === 'teacher' ? loginTeacher() : loginStudent(DEMO_STUDENTS[0].id);
    login.catch((err) => console.warn('Role switch failed:', err));
  };

  const logout = () => saveSession(null);

  const currentRole: UserRole = user ? user.role : 'teacher';
  const activeStudent: StudentProfile | null =
    user?.role === 'student' ? (user as StudentProfile) : DEMO_STUDENTS[0];

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        role: currentRole,
        permissions: getPermissionsForRole(currentRole),
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
