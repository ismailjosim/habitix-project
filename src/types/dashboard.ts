import type { AnalyticsRange } from './analytics';
import type { DailyActivity } from './activity';
import type { TeamPresence } from './team';

export type DashboardData = {
  range: AnalyticsRange;
  stats: {
    focusMinutes: number;
    focusSessions: number;
    currentStreak: number;
    completedTasks: number;
    helpPoints: number;
    helpEfficiency: number;
    trends: {
      focus: number;
      tasks: number;
      help: number;
    };
  };
  daily: DailyActivity[];
  notifications: Array<{
    id: string;
    type: string;
    title: string;
    body: string | null;
    createdAt: Date;
    actor: { displayName: string; avatarUrl: string | null } | null;
  }>;
  onlinePeers: TeamPresence[];
};

export type CorporateReportSnapshotItem = {
  id: string;
  teamId: string | null;
  periodStart: Date;
  periodEnd: Date;
  totalActiveStudents: number;
  totalFocusHours: number;
  averageFocusMinutesPerStudent: number;
  topModule: string | null;
  helpEfficiencyRatio: number;
  mentorFeedbackRating: number;
  generatedAt: Date;
  team: { name: string } | null;
};

export type CorporateReportData =
  | {
      mode: 'aggregate';
      range: { start: Date; end: Date };
      snapshots: CorporateReportSnapshotItem[];
    }
  | {
      mode: 'student';
      range: { start: Date; end: Date };
      students: Array<{ id: string; displayName: string; avatarUrl: string | null }>;
      report: {
        totalFocusMinutes: number;
        totalSessions: number;
        tasksCompleted: number;
        helpGivenPoints: number;
        helpReceivedCount: number;
        mentorRating: number | null;
        topCategory: string | null;
      } | null;
      modules: string[];
      selectedModule: string;
    };
