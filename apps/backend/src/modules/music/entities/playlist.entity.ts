import { User } from '../../../database/entities/user.entity';

export class Playlist {
  id!: string;

  name!: string;

  description!: string | null;

  tracks!: string[] | null;

  userId!: string;

  user?: User;

  createdAt!: Date;

  updatedAt!: Date;
}