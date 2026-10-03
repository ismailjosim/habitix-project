export interface ProfileData {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  email: string;
  role: string;
  bio: string | null;
  timezone: string;
  institution: string | null;
  department: string | null;
  totalFocusMinutes: number;
  helpPoints: number;
  currentStreak: number;
  createdAt: Date;
  team: {
    id: string;
    name: string;
    role: string;
  } | null;
  badges: Array<{
    id: string;
    badgeId: string;
    badgeName: string;
    badgeIcon: string;
    badgeDescription: string | null;
    periodKey: string;
    awardedAt: Date;
  }>;
}

export interface ProfileHeaderProps {
  profile: ProfileData;
}

export interface ProfileStatsProps {
  profile: ProfileData;
}

export interface ProfileFormProps {
  profile: ProfileData;
}

export interface ProfileBadgesProps {
  badges: ProfileData['badges'];
}
