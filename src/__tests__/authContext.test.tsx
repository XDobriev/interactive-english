import React from 'react';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { AuthProvider } from '../context/AuthContext';
import { useAuth } from '../context/authCore';
import { DEMO_STUDENTS } from '../context/demoData';

const wrapper = ({ children }: { children: React.ReactNode }) => <AuthProvider>{children}</AuthProvider>;
const STORAGE_KEY = 'interactive_english_session_v1';

beforeEach(() => {
  localStorage.clear();
});

describe('AuthProvider (demo mode)', () => {
  it('starts as the demo teacher', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.role).toBe('teacher');
    expect(result.current.permissions.canEditCurriculum).toBe(true);
  });

  it('logs a student in and restricts permissions', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(() => result.current.loginStudent(DEMO_STUDENTS[0].id));
    expect(result.current.role).toBe('student');
    expect(result.current.permissions.canRevealAnswers).toBe(false);
  });

  it('rejects an unknown student instead of silently logging in as someone else', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await expect(act(() => result.current.loginStudent('nobody-here'))).rejects.toThrow('Ученик не найден');
    expect(result.current.role).toBe('teacher');
  });

  it('rejects a wrong invite code and accepts the right one', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await expect(act(() => result.current.loginStudent('st-1', 'WRONG'))).rejects.toThrow('Неверный код');
    await act(() => result.current.loginStudent('st-1', DEMO_STUDENTS[0].inviteCode));
    expect(result.current.user?.id).toBe('st-1');
  });

  it('logs out and clears the stored session', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(() => result.current.loginStudent('st-2'));
    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();
    act(() => result.current.logout());
    expect(result.current.isAuthenticated).toBe(false);
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('ignores an expired stored session', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ token: 'old', user: DEMO_STUDENTS[0], expiresAt: Date.now() - 1000 })
    );
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.role).toBe('teacher');
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('restores a valid stored session', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ token: 'ok', user: DEMO_STUDENTS[1], expiresAt: Date.now() + 100000 })
    );
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.user?.id).toBe('st-2');
  });
});
