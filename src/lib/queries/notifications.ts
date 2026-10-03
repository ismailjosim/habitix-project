import { prisma } from '@/lib/prisma';
import { getCurrentUserProfile } from '@/lib/session';
import type { NotificationType, Prisma } from '@/generated/prisma/client';

import type { NotificationCategory, NotificationItem, NotificationsData } from '@/types';

export type { NotificationCategory, NotificationItem, NotificationsData };

const categoryTypes: Record<Exclude<NotificationCategory, 'all'>, NotificationType[]> = {
  tasks: ['TASK_ASSIGNED', 'TASK_DUE'],
  help: ['TEAM_UPDATE'],
  responses: ['HELP_RESPONSE', 'HELP_RESOLVED'],
  mentorship: ['MENTOR_FEEDBACK'],
  awards: ['BADGE_AWARDED'],
};

export async function getNotificationsData({
  category = 'all',
  page = 1,
  pageSize = 20,
}: {
  category?: NotificationCategory;
  page?: number;
  pageSize?: number;
} = {}): Promise<NotificationsData> {
  const current = await getCurrentUserProfile();
  if (!current) return { notifications: [], unreadCount: 0, total: 0, page: 1, pageSize };

  const safePage = Math.max(page, 1);
  const safePageSize = Math.min(Math.max(pageSize, 1), 50);
  const where: Prisma.NotificationWhereInput = {
    recipientProfileId: current.profile.id,
    ...(category === 'all' ? {} : { type: { in: categoryTypes[category] } }),
  };

  const [notifications, unreadCount, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      include: { actor: { select: { displayName: true, avatarUrl: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (safePage - 1) * safePageSize,
      take: safePageSize,
    }),
    prisma.notification.count({
      where: { recipientProfileId: current.profile.id, readAt: null },
    }),
    prisma.notification.count({ where }),
  ]);

  return { notifications, unreadCount, total, page: safePage, pageSize: safePageSize };
}

export async function getUnreadNotificationCount(profileId: string) {
  return prisma.notification.count({ where: { recipientProfileId: profileId, readAt: null } });
}
