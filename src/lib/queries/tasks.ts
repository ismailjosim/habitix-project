import { prisma } from '@/lib/prisma';
import { requireModuleAccess } from '@/lib/authorization';
import { canAssignTask } from '@/lib/permissions';
import { canManageTask } from '@/lib/permissions';
import type { Prisma, TaskStatus } from '@/generated/prisma/client';
import type {
  TaskFilters,
  BoardTask,
  TaskBoardData,
  AssignableStudent,
  AssignableTeam,
} from '@/types';

export type { TaskFilters, BoardTask, TaskBoardData, AssignableStudent, AssignableTeam };

export async function getTaskBoardData(filters: TaskFilters = {}): Promise<TaskBoardData> {
  const current = await requireModuleAccess('tasks');

  const { profile } = current;
  const isPlatformAdmin = profile.role === 'ADMIN';
  const canAssignTasks = canAssignTask(profile.role);
  const pageSize = 30;
  const page = Math.max(1, filters.page ?? 1);
  const q = filters.q?.trim().slice(0, 100) ?? '';
  const allowedStatuses = ['TODO', 'IN_PROGRESS', 'BLOCKED', 'IN_REVIEW', 'DONE'];
  const status = allowedStatuses.includes(filters.status ?? '') ? filters.status : undefined;
  const category =
    filters.category && filters.category !== 'all'
      ? filters.category.trim().slice(0, 80)
      : undefined;
  const visibilityWhere: Prisma.TaskWhereInput = {
    status: { not: 'ARCHIVED' },
    OR: [
      {
        type: 'PERSONAL',
        OR: [{ createdByProfileId: profile.id }, { assignedToProfileId: profile.id }],
      },
      {
        type: { in: ['MENTOR_ASSIGNED', 'ADMIN_ASSIGNED', 'TEAM'] },
        OR: [
          { createdByProfileId: profile.id },
          { assignedToProfileId: profile.id },
          { team: { memberships: { some: { profileId: profile.id, leftAt: null } } } },
        ],
      },
    ],
  };
  const where: Prisma.TaskWhereInput = {
    AND: [
      visibilityWhere,
      ...(q
        ? [
            {
              OR: [
                { title: { contains: q, mode: 'insensitive' as const } },
                { description: { contains: q, mode: 'insensitive' as const } },
                { category: { contains: q, mode: 'insensitive' as const } },
              ],
            },
          ]
        : []),
      ...(status ? [{ status: status as TaskStatus }] : []),
      ...(category ? [{ category }] : []),
    ],
  };

  const [tasks, total, categoryRows, assignmentTargets] = await Promise.all([
    prisma.task.findMany({
      where,
      include: {
        createdBy: { select: { id: true, displayName: true, avatarUrl: true } },
        assignedTo: { select: { id: true, displayName: true, avatarUrl: true } },
        subtasks: {
          select: { id: true, title: true, isDone: true },
          orderBy: { position: 'asc' },
        },
        team: {
          select: {
            memberships: {
              where: { profileId: profile.id, leftAt: null },
              select: { role: true },
            },
          },
        },
      },
      orderBy: [{ dueAt: 'asc' }, { createdAt: 'desc' }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.task.count({ where }),
    prisma.task.findMany({
      where: { AND: [visibilityWhere, { category: { not: null } }] },
      distinct: ['category'],
      select: { category: true },
      orderBy: { category: 'asc' },
    }),
    canAssignTasks
      ? getAssignmentTargets(profile.id, isPlatformAdmin)
      : Promise.resolve({ assignableStudents: [], assignableTeams: [] }),
  ]);

  const authorizedTasks = tasks.map((task) => ({
    ...task,
    canManage: canManageTask({
      role: profile.role,
      profileId: profile.id,
      createdByProfileId: task.createdByProfileId,
      assignedToProfileId: task.assignedToProfileId,
      teamRole: task.team?.memberships[0]?.role,
    }),
  }));

  return {
    personalTasks: authorizedTasks.filter((task) => task.type === 'PERSONAL'),
    assignedTasks: authorizedTasks.filter((task) => task.type !== 'PERSONAL'),
    assignableStudents: assignmentTargets.assignableStudents,
    assignableTeams: assignmentTargets.assignableTeams,
    currentRole: profile.role,
    currentProfileId: profile.id,
    canAssignTasks,
    total,
    page,
    pageSize,
    categories: categoryRows.flatMap(({ category }) => (category ? [category] : [])),
  };
}

async function getAssignmentTargets(profileId: string, isPlatformAdmin: boolean) {
  if (isPlatformAdmin) {
    const [students, teams] = await Promise.all([
      prisma.userProfile.findMany({
        where: { id: { not: profileId }, role: 'STUDENT' },
        select: { id: true, displayName: true, role: true },
        orderBy: { displayName: 'asc' },
      }),
      prisma.team.findMany({
        select: {
          id: true,
          name: true,
          _count: { select: { memberships: { where: { leftAt: null } } } },
        },
        orderBy: { name: 'asc' },
      }),
    ]);

    return {
      assignableStudents: students.map((student) => ({ ...student, teamName: null })),
      assignableTeams: teams.map((team) => ({
        id: team.id,
        name: team.name,
        memberCount: team._count.memberships,
      })),
    };
  }

  const [directAssignments, managedTeams] = await Promise.all([
    prisma.mentorAssignment.findMany({
      where: { mentorProfileId: profileId, endsAt: null },
      include: {
        team: { select: { name: true } },
        student: { select: { id: true, displayName: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.team.findMany({
      where: {
        OR: [
          { ownerProfileId: profileId },
          {
            memberships: {
              some: {
                profileId,
                leftAt: null,
                role: { in: ['LEAD', 'MENTOR', 'ADMIN'] },
              },
            },
          },
        ],
      },
      include: {
        memberships: {
          where: { leftAt: null },
          include: {
            profile: { select: { id: true, displayName: true, role: true } },
          },
          orderBy: { joinedAt: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    }),
  ]);

  const students = new Map<string, AssignableStudent>();

  directAssignments.forEach((assignment) => {
    students.set(assignment.student.id, {
      ...assignment.student,
      teamName: assignment.team?.name ?? null,
    });
  });

  managedTeams.forEach((team) => {
    team.memberships.forEach((membership) => {
      if (membership.profile.id === profileId) return;
      students.set(membership.profile.id, {
        ...membership.profile,
        teamName: team.name,
      });
    });
  });

  return {
    assignableStudents: [...students.values()].sort((a, b) =>
      a.displayName.localeCompare(b.displayName)
    ),
    assignableTeams: managedTeams.map((team) => ({
      id: team.id,
      name: team.name,
      memberCount: team.memberships.length,
    })),
  };
}
