import { prisma } from '@/lib/prisma';
import { requireModuleAccess } from '@/lib/authorization';
import type {
  FocusTaskOption,
  FocusSessionSummary,
  ActiveFocusSession,
  FocusModeData,
} from '@/types';

export type { FocusTaskOption, FocusSessionSummary, ActiveFocusSession, FocusModeData };

export async function getActiveFocusSession(profileId: string): Promise<ActiveFocusSession | null> {
  const session = await prisma.focusSession.findFirst({
    where: {
      profileId,
      status: { in: ['ACTIVE', 'PAUSED'] },
    },
    include: {
      task: { select: { title: true } },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return session ? formatActiveSession(session) : null;
}

type FocusMetadata = {
  elapsedSeconds?: number;
  lastStartedAt?: string | null;
  activityLabel?: string;
};

type FocusSessionWithTask = {
  id: string;
  taskId?: string | null;
  activityType: string;
  status: string;
  plannedMinutes: number;
  actualMinutes: number | null;
  startedAt: Date | null;
  completedAt: Date | null;
  notes: string | null;
  updatedAt: Date;
  task: { title: string } | null;
};

export async function getFocusModeData(): Promise<FocusModeData> {
  const current = await requireModuleAccess('focus');

  const { profile } = current;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [tasks, todaySessions, activeSession] = await Promise.all([
    prisma.task.findMany({
      where: {
        status: { notIn: ['DONE', 'ARCHIVED'] },
        OR: [
          { createdByProfileId: profile.id },
          { assignedToProfileId: profile.id },
          {
            team: {
              memberships: {
                some: {
                  profileId: profile.id,
                  leftAt: null,
                },
              },
            },
          },
        ],
      },
      select: {
        id: true,
        title: true,
        type: true,
        status: true,
      },
      orderBy: [{ dueAt: 'asc' }, { createdAt: 'desc' }],
      take: 25,
    }),
    prisma.focusSession.findMany({
      where: {
        profileId: profile.id,
        startedAt: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        task: { select: { title: true } },
      },
      orderBy: { startedAt: 'desc' },
      take: 12,
    }),
    prisma.focusSession.findFirst({
      where: {
        profileId: profile.id,
        status: { in: ['ACTIVE', 'PAUSED'] },
      },
      include: {
        task: { select: { title: true } },
      },
      orderBy: { updatedAt: 'desc' },
    }),
  ]);

  const todayFocusMinutes = todaySessions
    .filter((session) => session.status === 'COMPLETED')
    .reduce((total, session) => total + (session.actualMinutes ?? 0), 0);

  return {
    tasks,
    todaySessions: todaySessions.map(formatSessionSummary),
    activeSession: activeSession ? formatActiveSession(activeSession) : null,
    todayFocusMinutes,
  };
}

function parseMetadata(notes: string | null): FocusMetadata {
  if (!notes) return {};

  try {
    const parsed = JSON.parse(notes);
    return typeof parsed === 'object' && parsed ? parsed : {};
  } catch {
    return {};
  }
}

function getElapsedSeconds(session: {
  status: string;
  notes: string | null;
  startedAt: Date | null;
  updatedAt: Date;
}) {
  const metadata = parseMetadata(session.notes);
  const savedElapsed = Math.max(metadata.elapsedSeconds ?? 0, 0);

  if (session.status !== 'ACTIVE') {
    return savedElapsed;
  }

  const lastStartedAt = metadata.lastStartedAt
    ? new Date(metadata.lastStartedAt)
    : (session.startedAt ?? session.updatedAt);
  const activeSeconds = Math.max(Math.floor((Date.now() - lastStartedAt.getTime()) / 1000), 0);

  return savedElapsed + activeSeconds;
}

function formatSessionSummary(session: FocusSessionWithTask): FocusSessionSummary {
  const metadata = parseMetadata(session.notes);

  return {
    id: session.id,
    activityType: session.activityType,
    activityLabel: metadata.activityLabel ?? labelActivity(session.activityType),
    status: session.status,
    plannedMinutes: session.plannedMinutes,
    actualMinutes: session.actualMinutes,
    elapsedSeconds: getElapsedSeconds(session),
    startedAt: session.startedAt,
    completedAt: session.completedAt,
    taskTitle: session.task?.title ?? null,
  };
}

function formatActiveSession(session: FocusSessionWithTask): ActiveFocusSession {
  const summary = formatSessionSummary(session);
  const totalSeconds = session.plannedMinutes * 60;

  return {
    ...summary,
    taskId: session.taskId ?? null,
    remainingSeconds: Math.max(totalSeconds - summary.elapsedSeconds, 0),
  };
}

function labelActivity(activityType: string) {
  return activityType
    .split('_')
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
}
