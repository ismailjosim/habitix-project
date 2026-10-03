import { prisma } from '@/lib/prisma';
import { requireModuleAccess } from '@/lib/authorization';
import {
  buildDailyAnalytics,
  calculateCurrentStreak,
  rollingRange,
  summarizeFocus,
  summarizeHelp,
} from '@/lib/analytics';
const DEFAULT_DAYS = 365;

import type { ActivityData, DailyActivity, SessionRow } from '@/types';
export type { ActivityData, DailyActivity, SessionRow };

export async function getActivityData(rangeDays = DEFAULT_DAYS): Promise<ActivityData> {
  const current = await requireModuleAccess('activity');

  const { profile } = current;
  const safeDays = [30, 90, 180, 365].includes(rangeDays) ? rangeDays : DEFAULT_DAYS;
  const range = rollingRange(safeDays);
  const heatmapStart = range.start;

  const [sessions, tasksCompleted, awardedHelp] = await Promise.all([
    prisma.focusSession.findMany({
      where: {
        profileId: profile.id,
        status: 'COMPLETED',
        completedAt: { gte: heatmapStart },
      },
      select: {
        id: true,
        activityType: true,
        actualMinutes: true,
        plannedMinutes: true,
        completedAt: true,
        notes: true,
        task: { select: { id: true, title: true } },
      },
      orderBy: { completedAt: 'desc' },
    }),
    prisma.task.count({
      where: {
        status: 'DONE',
        completedAt: { gte: heatmapStart },
        assignedToProfileId: profile.id,
      },
    }),
    prisma.helpResponse.findMany({
      where: {
        authorProfileId: profile.id,
        pointsAwarded: { gt: 0 },
        updatedAt: { gte: heatmapStart },
      },
      select: { pointsAwarded: true, updatedAt: true },
    }),
  ]);

  const focusSummary = summarizeFocus(sessions);
  const helpSummary = summarizeHelp(
    [],
    awardedHelp.map((response) => ({ ...response, isAccepted: true }))
  );
  const daily = buildDailyAnalytics(
    range,
    sessions,
    awardedHelp.map((response) => ({ ...response, isAccepted: true }))
  );
  const focusDays = daily.filter((day) => day.focusMinutes > 0);
  const totalFocusMinutes = focusSummary.actualMinutes;
  const breakdown = buildBreakdown(sessions, totalFocusMinutes);

  return {
    rangeDays: safeDays,
    stats: {
      totalSessions: focusSummary.sessions,
      totalFocusMinutes,
      tasksCompleted,
      helpPoints: helpSummary.points,
      helpCreditMinutes: helpSummary.creditMinutes,
      currentStreak: calculateCurrentStreak(new Set(focusDays.map((day) => day.date))),
      bestDay: focusDays.sort((a, b) => b.focusMinutes - a.focusMinutes)[0] ?? null,
    },
    heatmap: daily,
    recentSessions: sessions.slice(0, 8).flatMap((session) =>
      session.completedAt
        ? [
            {
              id: session.id,
              activityLabel: getActivityLabel(session),
              actualMinutes: session.actualMinutes ?? 0,
              completedAt: session.completedAt,
              task: session.task,
            },
          ]
        : []
    ),
    breakdown,
  };
}

function buildBreakdown(sessions: SessionRow[], totalMinutes: number) {
  const minutesByType = new Map<string, { label: string; minutes: number }>();

  sessions.forEach((session) => {
    const label = getActivityLabel(session);
    const key = label.toLowerCase();
    const current = minutesByType.get(key) ?? { label, minutes: 0 };
    current.minutes += session.actualMinutes ?? 0;
    minutesByType.set(key, current);
  });

  return [...minutesByType.entries()]
    .map(([activityType, value]) => ({
      activityType,
      label: value.label,
      minutes: value.minutes,
      percentage: totalMinutes ? Math.round((value.minutes / totalMinutes) * 100) : 0,
    }))
    .sort((a, b) => b.minutes - a.minutes);
}

function getActivityLabel(session: Pick<SessionRow, 'activityType' | 'notes'>) {
  if (session.notes) {
    try {
      const metadata = JSON.parse(session.notes) as { activityLabel?: unknown };
      if (typeof metadata.activityLabel === 'string') return metadata.activityLabel;
    } catch {
      // Older sessions may contain free-form notes rather than timer metadata.
    }
  }

  return session.activityType
    .split('_')
    .map((word: string) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
}
