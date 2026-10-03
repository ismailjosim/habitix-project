import { prisma } from '@/lib/prisma';
import { requireModuleAccess } from '@/lib/authorization';
import type { HelpPostStatus, Prisma } from '@/generated/prisma/client';
import type { HelpDeskPost, HelpDeskData } from '@/types';
export type { HelpDeskPost, HelpDeskData };

export const MAX_PEER_HELPERS = 4;

export async function getHelpDeskData({
  q = '',
  status = 'all',
  topic = 'all',
  page = 1,
}: {
  q?: string;
  status?: string;
  topic?: string;
  page?: number;
} = {}): Promise<HelpDeskData> {
  const current = await requireModuleAccess('help');

  const membership = await prisma.teamMembership.findFirst({
    where: { profileId: current.profile.id, leftAt: null },
    select: { teamId: true, team: { select: { name: true } } },
  });

  if (!membership && !['ADMIN', 'MODERATOR'].includes(current.profile.role)) {
    return {
      ...emptyData(),
      currentProfileId: current.profile.id,
      currentRole: current.profile.role,
    };
  }

  const safePage = Math.max(1, page);
  const pageSize = 10;
  const search = q.trim().slice(0, 100);
  const allowedStatuses = ['OPEN', 'ANSWERED', 'RESOLVED'];
  const filteredStatus = allowedStatuses.includes(status) ? (status as HelpPostStatus) : undefined;
  const filteredTopic = topic !== 'all' ? topic.trim().slice(0, 80) : undefined;
  const baseWhere: Prisma.HelpPostWhereInput = {
    ...(membership ? { teamId: membership.teamId } : {}),
    status: { notIn: ['CLOSED', 'FLAGGED'] },
  };
  const where: Prisma.HelpPostWhereInput = {
    AND: [
      baseWhere,
      ...(filteredStatus ? [{ status: filteredStatus }] : []),
      ...(filteredTopic ? [{ topic: filteredTopic }] : []),
      ...(search
        ? [
            {
              OR: [
                { title: { contains: search, mode: 'insensitive' as const } },
                { body: { contains: search, mode: 'insensitive' as const } },
                { topic: { contains: search, mode: 'insensitive' as const } },
                { tags: { some: { tag: { contains: search, mode: 'insensitive' as const } } } },
              ],
            },
          ]
        : []),
    ],
  };

  const [posts, allPosts, total, topicRows] = await Promise.all([
    prisma.helpPost.findMany({
      where,
      include: {
        author: { select: { id: true, displayName: true, avatarUrl: true } },
        tags: { select: { tag: true }, orderBy: { tag: 'asc' } },
        responses: {
          include: {
            author: { select: { id: true, displayName: true, avatarUrl: true, role: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
      skip: (safePage - 1) * pageSize,
      take: pageSize,
    }),
    prisma.helpPost.findMany({
      where: baseWhere,
      select: {
        status: true,
        createdAt: true,
        resolvedAt: true,
        responses: {
          select: { pointsAwarded: true, createdAt: true, authorProfileId: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    }),
    prisma.helpPost.count({ where }),
    prisma.helpPost.findMany({
      where: { ...baseWhere, topic: { not: null } },
      distinct: ['topic'],
      select: { topic: true },
      orderBy: { topic: 'asc' },
    }),
  ]);

  const formatted = posts.map((post) => ({
    ...post,
    tags: post.tags.map((tag) => tag.tag),
    helperCount: new Set(
      post.responses
        .filter((response) => !['ADMIN', 'MODERATOR'].includes(response.author.role))
        .map((response) => response.author.id)
    ).size,
  }));

  return {
    posts: formatted,
    currentProfileId: current.profile.id,
    currentRole: current.profile.role,
    teamName: membership?.team.name ?? 'Organization moderation',
    stats: {
      open: allPosts.filter((post) => post.status !== 'RESOLVED').length,
      resolved: allPosts.filter((post) => post.status === 'RESOLVED').length,
      helpers: new Set(
        allPosts.flatMap((post) => post.responses.map((item) => item.authorProfileId))
      ).size,
      awardedPoints: allPosts.reduce(
        (total, post) => total + post.responses.reduce((sum, item) => sum + item.pointsAwarded, 0),
        0
      ),
      averageFirstResponseMinutes: averageMinutes(
        allPosts.flatMap((post) =>
          post.responses[0]
            ? [post.responses[0].createdAt.getTime() - post.createdAt.getTime()]
            : []
        )
      ),
      averageResolutionMinutes: averageMinutes(
        allPosts.flatMap((post) =>
          post.resolvedAt ? [post.resolvedAt.getTime() - post.createdAt.getTime()] : []
        )
      ),
    },
    total,
    page: safePage,
    pageSize,
    topics: topicRows.flatMap(({ topic }) => (topic ? [topic] : [])),
    canCreatePost: Boolean(membership),
    canParticipate: Boolean(membership),
  };
}

function emptyData(): HelpDeskData {
  return {
    posts: [],
    currentProfileId: null,
    currentRole: null,
    teamName: null,
    stats: {
      open: 0,
      resolved: 0,
      helpers: 0,
      awardedPoints: 0,
      averageFirstResponseMinutes: null,
      averageResolutionMinutes: null,
    },
    total: 0,
    page: 1,
    pageSize: 10,
    topics: [],
    canCreatePost: false,
    canParticipate: false,
  };
}

function averageMinutes(durations: number[]) {
  if (!durations.length) return null;
  return Math.round(
    durations.reduce((total, duration) => total + duration, 0) / durations.length / 60_000
  );
}
