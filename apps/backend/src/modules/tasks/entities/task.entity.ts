import { User } from '../../../database/entities/user.entity';

export type TaskPriority = 'low' | 'medium' | 'high';

export class Task {
  id!: string;

  title!: string;

  description!: string | null;

  dueDate!: Date;

  priority!: TaskPriority;

  isCompleted!: boolean;

  tags!: string[];

  userId!: string;

  user?: User;

  createdAt!: Date;

  updatedAt!: Date;
}
