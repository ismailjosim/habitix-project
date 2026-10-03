export type NotificationCategory = 'all' | 'tasks' | 'help' | 'responses' | 'mentorship' | 'awards';

export type NotificationItem = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  targetType: string | null;
  targetId: string | null;
  readAt: Date | null;
  createdAt: Date;
  actor: { displayName: string; avatarUrl: string | null } | null;
};

export type NotificationsData = {
  notifications: NotificationItem[];
  unreadCount: number;
  total: number;
  page: number;
  pageSize: number;
};

export interface NotificationsInboxProps {
  data: NotificationsData;
  category: NotificationCategory;
}

export interface NotificationPanelProps {
  notifications: NotificationItem[];
}
