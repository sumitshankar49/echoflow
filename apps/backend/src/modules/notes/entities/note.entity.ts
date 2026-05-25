import { User } from '../../../database/entities/user.entity';

export class Note {
  id!: string;

  title!: string;

  content!: string;

  voiceUrl!: string | null;

  tags!: string[] | null;

  isFavorite!: boolean;

  userId!: string;

  user?: User;

  createdAt!: Date;

  updatedAt!: Date;
}
