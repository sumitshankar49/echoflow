import { User } from '../../../database/entities/user.entity';

export class Mood {
  id!: string;

  mood!: string;

  userId!: string;

  user?: User;

  recordedAt!: Date;

  createdAt!: Date;

  updatedAt!: Date;
}
