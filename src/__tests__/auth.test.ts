import { describe, it, expect } from 'vitest';
import { getPermissionsForRole } from '../types/auth';

describe('RBAC Authorization Rules', () => {
  it('teacher role should have full educational and curriculum management permissions', () => {
    const teacherPerms = getPermissionsForRole('teacher');

    expect(teacherPerms.canEditCurriculum).toBe(true);
    expect(teacherPerms.canViewTeacherNotes).toBe(true);
    expect(teacherPerms.canRevealAnswers).toBe(true);
    expect(teacherPerms.canGradeHomework).toBe(true);
    expect(teacherPerms.canManageStudents).toBe(true);
    expect(teacherPerms.canAccessAiGenerator).toBe(true);
    expect(teacherPerms.canConductClassroomAsTeacher).toBe(true);
  });

  it('student role must be restricted from sensitive teacher tools and answers', () => {
    const studentPerms = getPermissionsForRole('student');

    // Security assertions: Students cannot see answers or alter curriculum
    expect(studentPerms.canEditCurriculum).toBe(false);
    expect(studentPerms.canViewTeacherNotes).toBe(false);
    expect(studentPerms.canRevealAnswers).toBe(false);
    expect(studentPerms.canGradeHomework).toBe(false);
    expect(studentPerms.canManageStudents).toBe(false);
    expect(studentPerms.canAccessAiGenerator).toBe(false);
    expect(studentPerms.canConductClassroomAsTeacher).toBe(false);
  });
});
