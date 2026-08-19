import {
  Flag,
  Trophy,
  GraduationCap,
  LifeBuoy,
  User,
  Settings,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: LucideIcon;
  /** Placeholder destinations are visible but not yet enterable. */
  enabled: boolean;
}

export const navItems: NavItem[] = [
  { id: 'sprint', label: 'Sprint', path: '/sprint', icon: Flag, enabled: true },
  { id: 'leaderboard', label: 'Leaderboard', path: '/leaderboard', icon: Trophy, enabled: false },
  {
    id: 'learning-profile',
    label: 'Learning Profile',
    path: '/learning-profile',
    icon: GraduationCap,
    enabled: false,
  },
  { id: 'support', label: 'Support', path: '/support', icon: LifeBuoy, enabled: false },
  { id: 'profile', label: 'Profile', path: '/profile', icon: User, enabled: false },
  { id: 'settings', label: 'Settings', path: '/settings', icon: Settings, enabled: false },
];
