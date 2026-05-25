import { User } from '../../../database/entities/user.entity';

export class Reminder {
  id!: string;

  title!: string;

  description!: string | null;

  remindAt!: Date;

  isCompleted!: boolean;

  userId!: string;

  user?: User;

  createdAt!: Date;

  updatedAt!: Date;
}