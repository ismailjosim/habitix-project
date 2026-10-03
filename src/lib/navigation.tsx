import {
  IconBell,
  IconBriefcase,
  IconChartBar,
  IconChecklist,
  IconHelpCircle,
  IconHome,
  IconMedal,
  IconNotebook,
  IconTargetArrow,
  IconUsers,
  IconUserSquareRounded,
  IconUsersGroup,
} from '@tabler/icons-react';

import type { NavItem } from '@/types';
export type { NavItem };

export const navigationItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: IconHome,
    module: 'dashboard',
  },
  {
    title: 'Activity',
    href: '/activity',
    icon: IconChartBar,
    module: 'activity',
  },
  {
    title: 'Focus Mode',
    href: '/focus-mode',
    icon: IconTargetArrow,
    module: 'focus',
  },
  {
    title: 'Tasks',
    href: '/tasks',
    icon: IconChecklist,
    module: 'tasks',
  },
  {
    title: 'Help Desk',
    href: '/help-desk',
    icon: IconHelpCircle,
    module: 'help',
  },
  {
    title: 'Leaderboard',
    href: '/leaderboard',
    icon: IconMedal,
    module: 'leaderboard',
  },
  {
    title: 'Team',
    href: '/team',
    icon: IconUsers,
    module: 'team',
  },
  {
    title: 'Notifications',
    href: '/notifications',
    icon: IconBell,
    module: 'notifications',
  },
  {
    title: 'Profile',
    href: '/profile',
    icon: IconUserSquareRounded,
    module: 'profile',
  },
  {
    title: 'Study Materials',
    href: '/study-materials',
    icon: IconNotebook,
    module: 'materials',
  },
  {
    title: 'User Management',
    href: '/admin/users',
    icon: IconUsersGroup,
    module: 'admin',
  },
  {
    title: 'Corporate Report',
    href: '/corporate-report',
    icon: IconBriefcase,
    module: 'corporateReport',
  },
];
