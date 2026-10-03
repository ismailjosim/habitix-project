import type {
  AnalyticsRange,
  FocusAnalyticsRow,
  HelpResponseAnalyticsRow,
  HelpPostAnalyticsRow,
  LeaderboardAggregation,
} from '@/types';

export const HELP_CREDIT_MINUTES_PER_POINT = 10;

export type {
  AnalyticsRange,
  FocusAnalyticsRow,
  HelpResponseAnalyticsRow,
  HelpPostAnalyticsRow,
  LeaderboardAggregation,
};

export function rollingRange(days: number, now = new Date()): AnalyticsRange {
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  const start = new Date(end);
  start.setDate(start.getDate() - (days - 1));
  start.setHours(0, 0, 0, 0);
  return { start, end };
}

export function previousRange(range: AnalyticsRange): AnalyticsRange {
  const duration = range.end.getTime() - range.start.getTime() + 1;
  return {
    start: new Date(range.start.getTime() - duration),
    end: new Date(range.start.getTime() - 1),
  };
}

export function summarizeFocus(rows: FocusAnalyticsRow[]) {
  const actualMinutes = rows.reduce((total, row) => total + (row.actualMinutes ?? 0), 0);
  const plannedMinutes = rows.reduce((total, row) => total + row.plannedMinutes, 0);
  return {
    sessions: rows.length,
    actualMinutes,
    plannedMinutes,
    activeDays: new Set(
      rows.flatMap(({ completedAt }) => (completedAt ? [dateKey(completedAt)] : []))
    ).size,
    completionRate: plannedMinutes ? Math.round((actualMinutes / plannedMinutes) * 100) : 0,
  };
}

export function summarizeHelp(
  posts: HelpPostAnalyticsRow[],
  responses: HelpResponseAnalyticsRow[]
) {
  const resolvedPosts = posts.filter(({ status }) => status === 'RESOLVED').length;
  const acceptedResponses = responses.filter(({ isAccepted }) => isAccepted).length;
  const points = responses.reduce((total, response) => total + response.pointsAwarded, 0);
  const firstResponseMinutes = posts.flatMap((post) =>
    post.responses[0]
      ? [(post.responses[0].createdAt.getTime() - post.createdAt.getTime()) / 60_000]
      : []
  );
  return {
    posts: posts.length,
    resolvedPosts,
    resolutionRate: posts.length ? Math.round((resolvedPosts / posts.length) * 100) : 0,
    responses: responses.length,
    acceptedResponses,
    efficiency: responses.length ? Math.round((acceptedResponses / responses.length) * 100) : 0,
    points,
    creditMinutes: points * HELP_CREDIT_MINUTES_PER_POINT,
    averageFirstResponseMinutes: firstResponseMinutes.length
      ? Math.round(
          firstResponseMinutes.reduce((total, minutes) => total + minutes, 0) /
            firstResponseMinutes.length
        )
      : null,
  };
}

export function percentChange(current: number, previous: number) {
  if (previous === 0) return current === 0 ? 0 : 100;
  return Math.round(((current - previous) / previous) * 100);
}

export function buildDailyAnalytics(
  range: AnalyticsRange,
  focusRows: FocusAnalyticsRow[],
  helpRows: HelpResponseAnalyticsRow[]
) {
  const days = new Map<string, { date: string; focusMinutes: number; helpCreditMinutes: number }>();
  const cursor = new Date(range.start);
  while (cursor <= range.end) {
    const key = dateKey(cursor);
    days.set(key, { date: key, focusMinutes: 0, helpCreditMinutes: 0 });
    cursor.setDate(cursor.getDate() + 1);
  }
  focusRows.forEach((row) => {
    if (!row.completedAt) return;
    const day = days.get(dateKey(row.completedAt));
    if (day) day.focusMinutes += row.actualMinutes ?? 0;
  });
  helpRows.forEach((row) => {
    const occurredAt = row.updatedAt ?? row.createdAt;
    if (!occurredAt) return;
    const day = days.get(dateKey(occurredAt));
    if (day) day.helpCreditMinutes += row.pointsAwarded * HELP_CREDIT_MINUTES_PER_POINT;
  });
  return [...days.values()].map((day) => ({
    ...day,
    totalMinutes: day.focusMinutes + day.helpCreditMinutes,
  }));
}

export function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function calculateCurrentStreak(activeDateKeys: Set<string>, now = new Date()) {
  const cursor = new Date(now);
  cursor.setHours(0, 0, 0, 0);
  if (!activeDateKeys.has(dateKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (activeDateKeys.has(dateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function startOfWeek(date: Date): Date {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const day = start.getDay();
  start.setDate(start.getDate() - (day === 0 ? 6 : day - 1));
  return start;
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function aggregateLeaderboardMetrics(
  profiles: Array<{
    profileId: string;
    displayName: string;
    avatarUrl: string | null;
    focusSessions: { actualMinutes: number | null; completedAt: Date | null }[];
    helpResponses: { pointsAwarded: number; updatedAt: Date; isAccepted: boolean }[];
  }>,
  periodStart: Date
): LeaderboardAggregation[] {
  return profiles.map((profile) => ({
    profileId: profile.profileId,
    displayName: profile.displayName,
    avatarUrl: profile.avatarUrl,
    focusMinutes: profile.focusSessions
      .filter((session) => session.completedAt && session.completedAt >= periodStart)
      .reduce((total, session) => total + (session.actualMinutes ?? 0), 0),
    helpPoints: profile.helpResponses
      .filter((response) => response.updatedAt >= periodStart)
      .reduce((total, response) => total + response.pointsAwarded, 0),
    resolutions: profile.helpResponses.filter(
      (response) => response.updatedAt >= periodStart && response.isAccepted
    ).length,
  }));
}

const DAY_MS = 24 * 60 * 60 * 1000;

export function parseCustomDateRange(from?: string, to?: string, defaultDays = 30): AnalyticsRange {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const defaultStart = new Date(today.getTime() - (defaultDays - 1) * DAY_MS);
  defaultStart.setHours(0, 0, 0, 0);

  const start = parseDateString(from, false) ?? defaultStart;
  const end = parseDateString(to, true) ?? today;

  // Validate range
  if (start > end || end.getTime() - start.getTime() > 366 * DAY_MS) {
    return { start: defaultStart, end: today };
  }
  return { start, end };
}

function parseDateString(value: string | undefined, endOfDay: boolean): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(endOfDay ? 23 : 0, endOfDay ? 59 : 0, endOfDay ? 59 : 0, endOfDay ? 999 : 0);
  return date;
}
