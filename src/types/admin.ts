import type { getAdminUsersData } from '@/lib/queries/admin-users';

export type AdminUsersData = Awaited<ReturnType<typeof getAdminUsersData>>;
export type ManagedProfile = AdminUsersData['profiles'][number];
export type DialogMode = 'view' | 'edit' | null;

export const adminRoles = ['STUDENT', 'MENTOR', 'ADMIN', 'MODERATOR', 'CORPORATE_VIEWER'] as const;
export const teamRoles = ['MEMBER', 'LEAD', 'MENTOR', 'ADMIN', 'VIEWER'] as const;

export type AdminRole = (typeof adminRoles)[number];
export type TeamRole = (typeof teamRoles)[number];
