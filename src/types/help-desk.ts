export type HelpDeskTopic =
  | 'Coding'
  | 'Styling'
  | 'Frontend'
  | 'Backend'
  | 'Database'
  | 'Learning'
  | 'Other';

export type HelpDeskUrgency = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface HelpDeskFiltersState {
  q: string;
  status: string;
  topic: string;
}

export type HelpDeskPost = {
  id: string;
  title: string;
  body: string;
  status: string;
  topic: string | null;
  urgency: string;
  imageUrl: string | null;
  createdAt: Date;
  resolvedAt: Date | null;
  author: { id: string; displayName: string; avatarUrl: string | null };
  tags: string[];
  helperCount: number;
  responses: {
    id: string;
    body: string;
    isAccepted: boolean;
    pointsAwarded: number;
    createdAt: Date;
    author: { id: string; displayName: string; avatarUrl: string | null; role: string };
  }[];
};

export type HelpDeskData = {
  posts: HelpDeskPost[];
  currentProfileId: string | null;
  currentRole: string | null;
  teamName: string | null;
  stats: {
    open: number;
    resolved: number;
    helpers: number;
    awardedPoints: number;
    averageFirstResponseMinutes: number | null;
    averageResolutionMinutes: number | null;
  };
  total: number;
  page: number;
  pageSize: number;
  topics: string[];
  canCreatePost: boolean;
  canParticipate: boolean;
};

export interface HelpDeskBoardProps {
  data: HelpDeskData;
  filters: HelpDeskFiltersState;
}

export interface CreateHelpPostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface HelpDeskFiltersProps {
  filters: HelpDeskFiltersState;
}

export interface HelpDeskHeaderProps {
  stats: HelpDeskData['stats'];
  onCreateClick: () => void;
}

export interface HelpDeskStatsGridProps {
  stats: HelpDeskData['stats'];
}

export interface HelpPostCardProps {
  post: HelpDeskPost;
  currentProfileId: string | null;
  currentRole: string | null;
}
