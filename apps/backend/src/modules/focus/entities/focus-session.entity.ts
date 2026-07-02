export class FocusSession {
  id!: string;

  userId!: string;

  durationMinutes!: number;

  label!: string | null;

  wasCompleted!: boolean;

  completedAt!: Date | null;

  createdAt!: Date;

  updatedAt!: Date;
}
