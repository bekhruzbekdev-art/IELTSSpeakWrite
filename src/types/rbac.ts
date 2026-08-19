/** The four roles in the system. */
export type Role = 'founder' | 'support-teacher' | 'teacher' | 'student';

/**
 * Every capability the UI gates on. Adding a screen means adding a permission
 * here, not scattering role checks through components.
 */
export type Permission =
  // Student surfaces
  | 'sprint.view'
  | 'leaderboard.view'
  | 'learning-profile.view'
  | 'support.ask'
  | 'unlock-request.create'
  // Staff surfaces
  | 'support.respond'
  | 'unlock-request.review'
  | 'attendance.manage'
  | 'cohort.monitor'
  | 'scores.override'
  // Founder surfaces
  | 'users.manage'
  | 'audit-log.view'
  | 'platform-analytics.view'
  // Everyone
  | 'profile.view'
  | 'settings.view';

export interface RoleDefinition {
  id: Role;
  label: string;
  /** One line describing what this role is responsible for. */
  summary: string;
  /** Where this role lands after signing in. */
  homePath: string;
}
