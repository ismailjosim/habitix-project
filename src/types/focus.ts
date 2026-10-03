export type TimerState = 'idle' | 'running' | 'paused' | 'completed' | 'stopped';

export type FocusTaskOption = {
  id: string;
  title: string;
  type: string;
  status: string;
};

export type FocusSessionSummary = {
  id: string;
  activityType: string;
  activityLabel: string;
  status: string;
  plannedMinutes: number;
  actualMinutes: number | null;
  elapsedSeconds: number;
  startedAt: Date | null;
  completedAt: Date | null;
  taskTitle: string | null;
};

export type ActiveFocusSession = FocusSessionSummary & {
  taskId: string | null;
  remainingSeconds: number;
};

export type FocusModeData = {
  tasks: FocusTaskOption[];
  todaySessions: FocusSessionSummary[];
  activeSession: ActiveFocusSession | null;
  todayFocusMinutes: number;
};

export interface FocusModeTimerProps {
  tasks: FocusTaskOption[];
  todaySessions: FocusSessionSummary[];
  activeSession: ActiveFocusSession | null;
  todayFocusMinutes: number;
}
