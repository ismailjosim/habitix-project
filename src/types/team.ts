export interface TeamMember {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  email: string;
  role: string;
  joinedAt: Date;
  profileRole: string;
  helpPoints: number;
}

export interface TeamData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  avatarUrl: string | null;
  owner: {
    id: string;
    displayName: string;
    email: string;
  };
  members: TeamMember[];
  roles: {
    leaders: TeamMember[];
    mentors: TeamMember[];
    members: TeamMember[];
    viewers?: TeamMember[];
  };
  memberCount: number;
  currentUserRole: string;
  currentUserProfileId: string;
}

export interface TeamTask {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  type: string;
  dueAt: Date | null;
  createdBy: {
    displayName: string;
    id: string;
  };
  assignedTo: {
    displayName: string;
    id: string;
  } | null;
}

export interface TeamHeaderProps {
  team: TeamData;
  canManage: boolean;
}

export interface TeamMembersProps {
  members: TeamMember[];
  canManage: boolean;
}

export interface TeamRoleCardsProps {
  roles: TeamData['roles'];
}

export interface TeamTasksProps {
  tasks: TeamTask[];
}

export type TeamPresence = {
  profileId: string;
  displayName: string;
  avatarUrl: string | null;
  role: string;
  isOnline: boolean;
  lastSeenAt: Date | null;
  focus: {
    status: string;
    activityLabel: string;
    taskTitle: string | null;
  } | null;
};

export interface TeamPresencePanelProps {
  members: TeamPresence[];
  title?: string;
}
