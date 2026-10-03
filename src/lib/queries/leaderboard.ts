import { prisma } from '@/lib/prisma';
import { requireModuleAccess } from '@/lib/authorization';
import { awardBadge, awardEligibleBadges } from '@/lib/badges';
import {
  aggregateLeaderboardMetrics,
  dateKey,
  monthKey,
  startOfMonth,
  startOfWeek,
} from '@/lib/analytics';

type Period = 'weekly' | 'monthly';

import type { LeaderboardRow, LeaderboardPeriodData, LeaderboardData } from '@/types';

export type { LeaderboardRow, LeaderboardPeriodData, LeaderboardData };

export async function getLeaderboardData(): Promise<LeaderboardData> {
  const current = await requireModuleAccess('leaderboard');

  const membership = await prisma.teamMembership.findFirst({
    where: { profileId: current.profile.id, leftAt: null },
    select: { teamId: true, team: { select: { name: true } } },
  });
  if (!membership) return { ...emptyData(), currentProfileId: current.profile.id };

  const now = new Date();
  const weekStart = startOfWeek(now);
  const monthStart = startOfMonth(now);
  const queryStart = weekStart < monthStart ? weekStart : monthStart;
  const members = await prisma.teamMembership.findMany({
    where: { teamId: membership.teamId, leftAt: null },
    select: {
      profile: {
        select: {
          id: true,
          displayName: true,
          avatarUrl: true,
          focusSessions: {
            where: { status: 'COMPLETED', completedAt: { gte: queryStart } },
            select: { actualMinutes: true, completedAt: true },
          },
          helpResponses: {
            where: { pointsAwarded: { gt: 0 }, updatedAt: { gte: queryStart } },
            select: { pointsAwarded: true, updatedAt: true, isAccepted: true },
          },
        },
      },
    },
  });

  const baseRows = members.map(({ profile }) => ({
    profileId: profile.id,
    displayName: profile.displayName,
    avatarUrl: profile.avatarUrl,
    focusSessions: profile.focusSessions,
    helpResponses: profile.helpResponses,
  }));

  const weekly = buildPeriod(baseRows, current.profile.id, weekStart, 'weekly');
  const monthly = buildPeriod(baseRows, current.profile.id, monthStart, 'monthly');

  await Promise.all(baseRows.map((row) => awardEligibleBadges(row.profileId)));
  if (weekly.performers[0]?.focusMinutes) {
    await awardBadge({
      profileId: weekly.performers[0].profileId,
      badgeName: 'Weekly Champion',
      reason: `Led ${membership.team.name} for the week of ${dateKey(weekStart)}`,
      periodKey: `week:${dateKey(weekStart)}`,
    });
  }
  if (monthly.performers[0]?.focusMinutes) {
    await awardBadge({
      profileId: monthly.performers[0].profileId,
      badgeName: 'Monthly Champion',
      reason: `Led ${membership.team.name} for ${monthKey(monthStart)}`,
      periodKey: `month:${monthKey(monthStart)}`,
    });
  }

  const badges = await prisma.badgeAward.findMany({
    where: {
      profile: { memberships: { some: { teamId: membership.teamId, leftAt: null } } },
    },
    select: {
      id: true,
      profileId: true,
      periodKey: true,
      awardedAt: true,
      profile: { select: { displayName: true } },
      badge: { select: { name: true, description: true, iconName: true } },
    },
    orderBy: { awardedAt: 'desc' },
  });

  return {
    teamName: membership.team.name,
    currentProfileId: current.profile.id,
    weekly,
    monthly,
    badges: badges.map((award) => ({
      id: award.id,
      profileId: award.profileId,
      displayName: award.profile.displayName,
      badgeName: award.badge.name,
      badgeDescription: award.badge.description,
      iconName: award.badge.iconName,
      periodKey: award.periodKey,
      awardedAt: award.awardedAt,
      isCurrentUser: award.profileId === current.profile.id,
    })),
  };
}

function buildPeriod(
  rows: Array<{
    profileId: string;
    displayName: string;
    avatarUrl: string | null;
    focusSessions: { actualMinutes: number | null; completedAt: Date | null }[];
    helpResponses: { pointsAwarded: number; updatedAt: Date; isAccepted: boolean }[];
  }>,
  currentProfileId: string,
  periodStart: Date,
  period: Period
): LeaderboardPeriodData {
  const totals = aggregateLeaderboardMetrics(rows, periodStart).map((metric) => ({
    ...metric,
    isCurrentUser: metric.profileId === currentProfileId,
  }));

  const performers = rankRows(totals, (a, b) => b.focusMinutes - a.focusMinutes);
  const contributors = rankRows(
    totals,
    (a, b) => b.helpPoints - a.helpPoints || b.resolutions - a.resolutions
  );

  return {
    label: period === 'weekly' ? 'This week' : 'This month',
    performers,
    contributors,
    currentUserPerformerRank: performers.find((row) => row.isCurrentUser)?.rank ?? null,
    currentUserContributorRank: contributors.find((row) => row.isCurrentUser)?.rank ?? null,
  };
}

function rankRows(
  rows: Omit<LeaderboardRow, 'rank'>[],
  compareMetric: (a: Omit<LeaderboardRow, 'rank'>, b: Omit<LeaderboardRow, 'rank'>) => number
) {
  return [...rows]
    .sort(
      (a, b) =>
        compareMetric(a, b) ||
        a.displayName.localeCompare(b.displayName) ||
        a.profileId.localeCompare(b.profileId)
    )
    .map((row, index) => ({ ...row, rank: index + 1 }));
}

function emptyPeriod(label: string): LeaderboardPeriodData {
  return {
    label,
    performers: [],
    contributors: [],
    currentUserPerformerRank: null,
    currentUserContributorRank: null,
  };
}

function emptyData(): LeaderboardData {
  return {
    teamName: null,
    currentProfileId: null,
    weekly: emptyPeriod('This week'),
    monthly: emptyPeriod('This month'),
    badges: [],
  };
}
