export type HabitFrequency = 'daily' | 'weekly';

export class Habit {
  id!: string;
  userId!: string;
  name!: string;
  description!: string | null;
  color!: string;
  icon!: string;
  frequency!: HabitFrequency;
  targetDaysPerWeek!: number;
  isArchived!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}

export class HabitWithStats extends Habit {
  currentStreak!: number;
  longestStreak!: number;
  totalCompletions!: number;
  completedToday!: boolean;
  completionRate!: number;
}

export class HabitLog {
  id!: string;
  habitId!: string;
  userId!: string;
  logDate!: Date;
  note!: string | null;
  createdAt!: Date;
}
