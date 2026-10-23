import { createContext, useContext } from 'react';
import type { User, UserRole, AuthSession, AuthPermissions, TeacherProfile, StudentProfile } from '../types/auth';

export interface AuthContextType {
  user: User | null;
  session: AuthSession | null;
  role: UserRole;
  permissions: AuthPermissions;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginTeacher: (email?: string, name?: string) => Promise<void>;
  /** Rejects with an Error when the student is unknown or the invite code does not match. */
  loginStudent: (studentIdOrName: string, inviteCode?: string) => Promise<void>;
  switchRole: (newRole: UserRole) => void;
  logout: () => void;
  activeStudent: StudentProfile | null;
  demoTeacher: TeacherProfile;
  demoStudents: StudentProfile[];
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
