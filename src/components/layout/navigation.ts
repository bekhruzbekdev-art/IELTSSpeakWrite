import {
  CalendarCheck,
  LayoutGrid,
  LifeBuoy,
  Settings,
  ShieldCheck,
  Sparkles,
  Trophy,
  UserRound,
  type LucideIcon,
} from 'lucide-react';
import { can } from '../../lib/permissions';
import type { Permission, Role } from '../../types/rbac';

export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: LucideIcon;
  /** The item shows when the role holds ANY of these. */
  anyOf: Permission[];
  /** Match this route exactly, so parents don't light up for children. */
  exact?: boolean;
}

export interface NavSection {
  id: string;
  label: string;
  items: NavItem[];
}

const SECTIONS: NavSection[] = [
  {
    id: 'menu',
    label: 'Menu',
    items: [
      { id: 'sprint', label: 'Sprint', path: '/sprint', icon: LayoutGrid, anyOf: ['sprint.view'] },
      {
        id: 'leaderboard',
        label: 'Leaderboard',
        path: '/leaderboard',
        icon: Trophy,
        anyOf: ['leaderboard.view'],
      },
      {
        id: 'learning-profile',
        label: 'Learning Profile',
        path: '/profile/learning',
        icon: Sparkles,
        anyOf: ['learning-profile.view'],
      },
      {
        id: 'support',
        label: 'Support',
        path: '/support',
        icon: LifeBuoy,
        anyOf: ['support.ask', 'support.respond', 'unlock-request.review'],
      },
    ],
  },
  {
    id: 'admin',
    label: 'Admin',
    items: [
      {
        id: 'admin-home',
        label: 'Admin Panel',
        path: '/admin',
        icon: ShieldCheck,
        anyOf: ['cohort.monitor', 'users.manage', 'audit-log.view', 'platform-analytics.view'],
        exact: true,
      },
      {
        id: 'attendance',
        label: 'Attendance',
        path: '/admin/attendance',
        icon: CalendarCheck,
        anyOf: ['attendance.manage'],
      },
    ],
  },
  {
    id: 'account',
    label: 'Account',
    items: [
      {
        id: 'profile',
        label: 'Profile',
        path: '/profile',
        icon: UserRound,
        anyOf: ['profile.view'],
        exact: true,
      },
      {
        id: 'settings',
        label: 'Settings',
        path: '/settings',
        icon: Settings,
        anyOf: ['settings.view'],
      },
    ],
  },
];

/** Sections and items the role can actually reach, empties dropped. */
export function navigationFor(role: Role): NavSection[] {
  return SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) =>
      item.anyOf.some((permission) => can(role, permission)),
    ),
  })).filter((section) => section.items.length > 0);
}
