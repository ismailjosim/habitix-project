export type DailyActivity = {
  date: string;
  focusMinutes: number;
  helpCreditMinutes: number;
  totalMinutes: number;
};

export type ActivityData = {
  rangeDays: number;
  stats: {
    totalSessions: number;
    totalFocusMinutes: number;
    tasksCompleted: number;
    helpPoints: number;
    helpCreditMinutes: number;
    currentStreak: number;
    bestDay: DailyActivity | null;
  };
  heatmap: DailyActivity[];
  recentSessions: {
    id: string;
    activityLabel: string;
    actualMinutes: number;
    completedAt: Date;
    task: { id: string; title: string } | null;
  }[];
  breakdown: {
    activityType: string;
    label: string;
    minutes: number;
    percentage: number;
  }[];
};

export type SessionRow = {
  id: string;
  activityType: string;
  actualMinutes: number | null;
  plannedMinutes: number;
  completedAt: Date | null;
  notes: string | null;
  task: { id: string; title: string } | null;
};

export interface ActivityDashboardProps {
  data: ActivityData;
}

export interface ActivityHeatmapProps {
  days: { date: string; value: number }[] | DailyActivity[];
}
