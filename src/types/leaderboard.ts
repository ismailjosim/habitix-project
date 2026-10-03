export type LeaderboardPeriod = 'weekly' | 'monthly';

export type LeaderboardRow = {
  profileId: string;
  displayName: string;
  avatarUrl: string | null;
  rank: number;
  focusMinutes: number;
  helpPoints: number;
  resolutions: number;
  isCurrentUser: boolean;
};

export type LeaderboardPeriodData = {
  label: string;
  performers: LeaderboardRow[];
  contributors: LeaderboardRow[];
  currentUserPerformerRank: number | null;
  currentUserContributorRank: number | null;
};

export interface LeaderboardBadgeItem {
  id: string;
  profileId: string;
  displayName: string;
  badgeName: string;
  badgeDescription: string | null;
  iconName: string;
  periodKey: string;
  awardedAt: Date;
  isCurrentUser: boolean;
}

export type LeaderboardData = {
  teamName: string | null;
  currentProfileId: string | null;
  weekly: LeaderboardPeriodData;
  monthly: LeaderboardPeriodData;
  badges: LeaderboardBadgeItem[];
};

export interface LeaderboardRankingCardProps {
  title: string;
  description: string;
  rows: LeaderboardRow[];
  metricLabel: string;
  getMetricValue: (row: LeaderboardRow) => string;
}

export interface LeaderboardMetricsGridProps {
  periodData: LeaderboardPeriodData;
}

export interface LeaderboardHeaderProps {
  period: LeaderboardPeriod;
  onPeriodChange: (period: LeaderboardPeriod) => void;
  teamName: string | null;
}

export interface LeaderboardChampionsProps {
  topPerformer?: LeaderboardRow;
  topContributor?: LeaderboardRow;
}

export interface LeaderboardBadgeGalleryProps {
  badges: LeaderboardBadgeItem[];
}
