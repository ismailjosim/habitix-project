import type { IconChecklist } from '@tabler/icons-react';
import type { getTaskDetail } from '@/lib/queries/task-detail';

export type BoardSection = 'personal' | 'assigned';
export type BoardStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export interface BoardStatusConfig {
  value: BoardStatus;
  title: string;
  icon: typeof IconChecklist;
  tone: string;
}

export interface TaskBoardFiltersState {
  q?: string;
  status?: string;
  category?: string;
}

export type TaskFilters = {
  q?: string;
  status?: string;
  category?: string;
  page?: number;
};

export type BoardTask = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  type: string;
  category: string | null;
  dueAt: Date | null;
  createdAt: Date;
  canManage: boolean;
  assignedTo: {
    id: string;
    displayName: string;
    avatarUrl: string | null;
  } | null;
  createdBy: {
    id: string;
    displayName: string;
    avatarUrl: string | null;
  };
  subtasks: {
    id: string;
    title: string;
    isDone: boolean;
  }[];
};

export type AssignableStudent = {
  id: string;
  displayName: string;
  role: string;
  teamName: string | null;
};

export type AssignableTeam = {
  id: string;
  name: string;
  memberCount: number;
};

export type TaskBoardData = {
  personalTasks: BoardTask[];
  assignedTasks: BoardTask[];
  assignableStudents: AssignableStudent[];
  assignableTeams: AssignableTeam[];
  currentRole: string | null;
  currentProfileId: string | null;
  canAssignTasks: boolean;
  total: number;
  page: number;
  pageSize: number;
  categories: string[];
};

export interface TaskBoardProps {
  personalTasks: BoardTask[];
  assignedTasks: BoardTask[];
  assignableStudents: AssignableStudent[];
  assignableTeams: AssignableTeam[];
  currentRole: string | null;
  currentProfileId: string | null;
  canAssignTasks: boolean;
  filters: TaskBoardFiltersState;
  total: number;
  page: number;
  pageSize: number;
  categories: string[];
}

export type TaskDetail = NonNullable<Awaited<ReturnType<typeof getTaskDetail>>>;

export interface TaskDetailViewProps {
  task: TaskDetail;
}

export interface TaskSubtasksCardProps {
  taskId: string;
  subtasks: TaskDetail['subtasks'];
  canManage: boolean;
}

export interface TaskMetadataSidebarProps {
  task: TaskDetail;
  canManage: boolean;
}

export interface TaskFormFieldsProps {
  currentCategory?: string;
  currentPriority?: string;
  currentStatus?: string;
}

export interface TaskDetailHeaderProps {
  task: TaskDetail;
  canManage: boolean;
}

export interface TaskCommentsCardProps {
  taskId: string;
  comments: TaskDetail['comments'];
  currentProfileId: string;
  userRole?: string;
}

export interface TaskCardProps {
  task: BoardTask;
  section: BoardSection;
}

export interface TaskBoardSectionNavProps {
  activeSection: BoardSection;
  onChange: (section: BoardSection) => void;
  personalCount: number;
  assignedCount: number;
}

export interface TaskBoardHeaderProps {
  canAssign: boolean;
  assignableStudents: AssignableStudent[];
  assignableTeams: AssignableTeam[];
  categories: string[];
}

export interface TaskBoardFiltersProps {
  filters: TaskBoardFiltersState;
  categories: string[];
}

export interface TaskBoardColumnProps {
  status: BoardStatusConfig;
  tasks: BoardTask[];
  section: BoardSection;
}

export interface TaskActivityHistoryCardProps {
  activities: TaskDetail['activities'];
}

export interface CreateTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: string[];
}

export interface AssignTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  students: AssignableStudent[];
  teams: AssignableTeam[];
  categories: string[];
}
