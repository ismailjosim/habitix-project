import { prisma } from '@/lib/prisma';
import { getCurrentSession } from '@/lib/session';
import { notFound } from 'next/navigation';

import type { ProfileData } from '@/types';
export type { ProfileData };

export async function getProfileData(): Promise<ProfileData> {
  const session = await getCurrentSession();
  if (!session) {
    notFound();
  }

  const profile = await prisma.userProfile.findUnique({
    where: { authUserId: session.user.id },
    include: {
      authUser: true,
      memberships: {
        where: { role: { in: ['MEMBER', 'LEAD', 'MENTOR', 'ADMIN'] } },
        include: { team: true },
        take: 1,
      },
      awardedBadges: {
        include: { badge: true },
        orderBy: { awardedAt: 'desc' },
      },
    },
  });

  if (!profile) {
    notFound();
  }

  const team = profile.memberships[0]
    ? {
        id: profile.memberships[0].team.id,
        name: profile.memberships[0].team.name,
        role: profile.memberships[0].role,
      }
    : null;

  return {
    id: profile.id,
    displayName: profile.displayName,
    avatarUrl: profile.avatarUrl,
    email: profile.authUser.email,
    role: profile.role,
    bio: profile.bio,
    timezone: profile.timezone,
    institution: profile.institution,
    department: profile.department,
    totalFocusMinutes: profile.totalFocusMinutes,
    helpPoints: profile.helpPoints,
    currentStreak: profile.currentStreak,
    createdAt: profile.createdAt,
    team,
    badges: profile.awardedBadges.map((award) => ({
      id: award.id,
      badgeId: award.badgeId,
      badgeName: award.badge.name,
      badgeIcon: award.badge.iconName,
      badgeDescription: award.badge.description,
      periodKey: award.periodKey,
      awardedAt: award.awardedAt,
    })),
  };
}
