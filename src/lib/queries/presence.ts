import { prisma } from '@/lib/prisma';
import { PRESENCE_STALE_AFTER_MS } from '@/lib/presence';
import type { TeamPresence } from '@/types';
export type { TeamPresence };

export async function getTeamPresence({
  teamId,
  viewerProfileId,
  includeViewer = true,
}: {
  teamId: string;
  viewerProfileId: string;
  includeViewer?: boolean;
}): Promise<TeamPresence[]> {
  const viewerMembership = await prisma.teamMembership.findFirst({
    where: { teamId, profileId: viewerProfileId, leftAt: null },
    select: { id: true },
  });

  if (!viewerMembership) return [];

  const memberships = await prisma.teamMembership.findMany({
    where: {
      teamId,
      leftAt: null,
      ...(includeViewer ? {} : { profileId: { not: viewerProfileId } }),
    },
    select: {
      role: true,
      profile: {
        select: {
          id: true,
          displayName: true,
          avatarUrl: true,
          presence: { select: { lastSeenAt: true } },
          focusSessions: {
            where: { status: { in: ['ACTIVE', 'PAUSED'] } },
            select: {
              status: true,
              activityType: true,
              notes: true,
              task: { select: { title: true, teamId: true } },
            },
            orderBy: { updatedAt: 'desc' },
            take: 1,
          },
        },
      },
    },
  });

  const now = Date.now();

  return memberships
    .map((membership) => {
      const { profile } = membership;
      const session = profile.focusSessions[0] ?? null;
      const lastSeenAt = profile.presence?.lastSeenAt ?? null;
      const isOnline = Boolean(lastSeenAt && now - lastSeenAt.getTime() <= PRESENCE_STALE_AFTER_MS);

      return {
        profileId: profile.id,
        displayName: profile.displayName,
        avatarUrl: profile.avatarUrl,
        role: membership.role,
        isOnline,
        lastSeenAt,
        focus:
          isOnline && session
            ? {
                status: session.status,
                activityLabel: getActivityLabel(session.activityType, session.notes),
                taskTitle: session.task?.teamId === teamId ? session.task.title : null,
              }
            : null,
      };
    })
    .sort((a, b) => {
      const rank = (member: TeamPresence) => (member.focus ? 0 : member.isOnline ? 1 : 2);
      return rank(a) - rank(b) || a.displayName.localeCompare(b.displayName);
    });
}

function getActivityLabel(activityType: string, notes: string | null) {
  if (notes) {
    try {
      const metadata = JSON.parse(notes) as { activityLabel?: unknown };
      if (typeof metadata.activityLabel === 'string') return metadata.activityLabel;
    } catch {
      // Sessions created outside the timer may contain free-form notes.
    }
  }

  return activityType
    .split('_')
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
}
