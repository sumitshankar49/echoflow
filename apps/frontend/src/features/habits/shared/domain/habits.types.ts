export type HabitFrequency = 'daily' | 'weekly';

export interface Habit {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  color: string;
  icon: string;
  frequency: HabitFrequency;
  targetDaysPerWeek: number;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HabitWithStats extends Habit {
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  completedToday: boolean;
  completionRate: number;
}

export interface HabitLog {
  id: string;
  habitId: string;
  userId: string;
  logDate: string;
  note: string | null;
  createdAt: string;
}

export interface CreateHabitPayload {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  frequency?: HabitFrequency;
  targetDaysPerWeek?: number;
}

export interface UpdateHabitPayload {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  frequency?: HabitFrequency;
  targetDaysPerWeek?: number;
  isArchived?: boolean;
}

export interface CheckInPayload {
  note?: string;
}
