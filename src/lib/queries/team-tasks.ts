import { prisma } from '@/lib/prisma';
import { requireModuleAccess } from '@/lib/authorization';
import { notFound } from 'next/navigation';

import type { TeamTask } from '@/types';
export type { TeamTask };

export async function getTeamTasks(teamId: string): Promise<TeamTask[]> {
  const { profile } = await requireModuleAccess('team');
  const membership = await prisma.teamMembership.findUnique({
    where: { teamId_profileId: { teamId, profileId: profile.id } },
    select: { leftAt: true },
  });
  if (!membership || membership.leftAt) notFound();

  // Get team-assigned tasks (where team is set)
  const teamTasks = await prisma.task.findMany({
    where: {
      teamId,
      type: 'MENTOR_ASSIGNED',
      status: { not: 'ARCHIVED' },
    },
    include: {
      createdBy: {
        select: { displayName: true, id: true },
      },
      assignedTo: {
        select: { displayName: true, id: true },
      },
    },
    orderBy: [{ dueAt: 'asc' }, { createdAt: 'desc' }],
    take: 10,
  });

  // Get tasks assigned directly to user from the team
  const userTasks = await prisma.task.findMany({
    where: {
      assignedToProfileId: profile.id,
      teamId,
      status: { not: 'ARCHIVED' },
    },
    include: {
      createdBy: {
        select: { displayName: true, id: true },
      },
      assignedTo: {
        select: { displayName: true, id: true },
      },
    },
    orderBy: [{ dueAt: 'asc' }, { createdAt: 'desc' }],
  });

  // Combine and deduplicate
  const taskMap = new Map<string, TeamTask>();

  [...teamTasks, ...userTasks].forEach((task) => {
    if (!taskMap.has(task.id)) {
      taskMap.set(task.id, {
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        type: task.type,
        dueAt: task.dueAt,
        createdBy: task.createdBy,
        assignedTo: task.assignedTo,
      });
    }
  });

  return Array.from(taskMap.values()).slice(0, 10);
}
