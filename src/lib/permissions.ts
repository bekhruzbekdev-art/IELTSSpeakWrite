import type { Permission, Role, RoleDefinition } from '../types/rbac';

/**
 * ============================================================================
 * CLIENT-SIDE POLICY ONLY — NOT A SECURITY BOUNDARY.
 * ============================================================================
 *
 * There is no server yet, so the role lives in the browser and a determined
 * user can change it. This module exists so that (a) the UI has exactly one
 * place that decides who sees what, and (b) the future server can mirror the
 * same table. Until that server exists, treat every permission here as a
 * convenience, never as protection for anything sensitive.
 */

export const ROLE_DEFINITIONS: Record<Role, RoleDefinition> = {
  founder: {
    id: 'founder',
    label: 'Founder',
    summary: 'Full system access, platform analytics, audit logs, user management.',
    homePath: '/admin',
  },
  'support-teacher': {
    id: 'support-teacher',
    label: 'Support Teacher',
    summary:
      'Operations lead. Answers support chats, reviews day unlock requests, monitors cohort progress.',
    homePath: '/admin',
  },
  teacher: {
    id: 'teacher',
    label: 'Teacher',
    summary:
      'Cohort controller. Runs live lesson attendance, overrides AI scores, sees assigned students.',
    homePath: '/admin/attendance',
  },
  student: {
    id: 'student',
    label: 'Student',
    summary: 'Standard runner view — the 30-day Sprint.',
    homePath: '/sprint',
  },
};

const STUDENT_PERMISSIONS: Permission[] = [
  'sprint.view',
  'leaderboard.view',
  'learning-profile.view',
  'support.ask',
  'unlock-request.create',
  'profile.view',
  'settings.view',
];

const TEACHER_PERMISSIONS: Permission[] = [
  'attendance.manage',
  'scores.override',
  'cohort.monitor',
  'profile.view',
  'settings.view',
];

const SUPPORT_TEACHER_PERMISSIONS: Permission[] = [
  'support.respond',
  'unlock-request.review',
  'attendance.manage',
  'cohort.monitor',
  'profile.view',
  'settings.view',
];

const ALL_PERMISSIONS: Permission[] = [
  'sprint.view',
  'leaderboard.view',
  'learning-profile.view',
  'support.ask',
  'unlock-request.create',
  'support.respond',
  'unlock-request.review',
  'attendance.manage',
  'cohort.monitor',
  'scores.override',
  'users.manage',
  'audit-log.view',
  'platform-analytics.view',
  'profile.view',
  'settings.view',
];

export const ROLE_PERMISSIONS: Record<Role, ReadonlySet<Permission>> = {
  founder: new Set(ALL_PERMISSIONS),
  'support-teacher': new Set(SUPPORT_TEACHER_PERMISSIONS),
  teacher: new Set(TEACHER_PERMISSIONS),
  student: new Set(STUDENT_PERMISSIONS),
};

export function can(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].has(permission);
}

export function canAny(role: Role, permissions: Permission[]): boolean {
  return permissions.some((permission) => can(role, permission));
}

/** Staff roles share the admin surfaces; students never reach them. */
export function isStaff(role: Role): boolean {
  return role !== 'student';
}

export const SELECTABLE_ROLES: Role[] = [
  'student',
  'teacher',
  'support-teacher',
  'founder',
];
