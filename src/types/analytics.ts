export type AnalyticsRange = { start: Date; end: Date };

export type FocusAnalyticsRow = {
  actualMinutes: number | null;
  plannedMinutes: number;
  completedAt: Date | null;
  activityType?: string;
};

export type HelpResponseAnalyticsRow = {
  pointsAwarded: number;
  isAccepted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

export type HelpPostAnalyticsRow = {
  status: string;
  createdAt: Date;
  resolvedAt: Date | null;
  responses: { createdAt: Date }[];
};

export type LeaderboardAggregation = {
  profileId: string;
  displayName: string;
  avatarUrl: string | null;
  focusMinutes: number;
  helpPoints: number;
  resolutions: number;
};
