import type React from 'react';
import { ActiveFocusSession } from './focus';

export interface AppShellUser {
  name: string;
  email: string;
  image?: string | null;
  role: string;
  unreadNotificationCount: number;
}

export interface AppShellProps {
  children: React.ReactNode;
  activeFocusSession: ActiveFocusSession | null;
  user: AppShellUser;
}

export interface TopBarProps {
  user: AppShellUser;
  activeFocusSession: ActiveFocusSession | null;
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

export interface SidebarContentProps {
  role: string;
  collapsed: boolean;
  activeFocusSession: ActiveFocusSession | null;
}
