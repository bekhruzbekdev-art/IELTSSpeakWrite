import {
  LayoutGrid,
  LifeBuoy,
  Settings,
  Sparkles,
  Trophy,
  UserRound,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: LucideIcon;
  enabled: boolean;
  /** Shown on hover/focus when the item is disabled. */
  tooltip?: string;
  /** Match nested routes (e.g. /profile should not light up for /profile/learning). */
  exact?: boolean;
}

export const navItems: NavItem[] = [
  { id: 'sprint', label: 'Sprint', path: '/sprint', icon: LayoutGrid, enabled: true },
  { id: 'leaderboard', label: 'Leaderboard', path: '/leaderboard', icon: Trophy, enabled: true },
  {
    id: 'learning-profile',
    label: 'Learning Profile',
    path: '/profile/learning',
    icon: Sparkles,
    enabled: true,
  },
  {
    id: 'support',
    label: 'Support',
    path: '/support',
    icon: LifeBuoy,
    enabled: false,
    tooltip: 'Coming soon',
  },
  {
    id: 'profile',
    label: 'Profile',
    path: '/profile',
    icon: UserRound,
    enabled: true,
    exact: true,
  },
  {
    id: 'settings',
    label: 'Settings',
    path: '/settings',
    icon: Settings,
    enabled: false,
    tooltip: 'Coming soon',
  },
];
