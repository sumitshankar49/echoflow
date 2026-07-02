export interface FocusSettings {
  id: string;
  userId: string;
  focusDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsUntilLongBreak: number;
  autoStartBreaks: boolean;
  autoStartSessions: boolean;
  soundEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FocusSession {
  id: string;
  userId: string;
  durationMinutes: number;
  label: string | null;
  wasCompleted: boolean;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateFocusSettingsPayload {
  focusDuration?: number;
  shortBreakDuration?: number;
  longBreakDuration?: number;
  sessionsUntilLongBreak?: number;
  autoStartBreaks?: boolean;
  autoStartSessions?: boolean;
  soundEnabled?: boolean;
}

export interface CreateFocusSessionPayload {
  durationMinutes: number;
  label?: string;
  wasCompleted?: boolean;
}
