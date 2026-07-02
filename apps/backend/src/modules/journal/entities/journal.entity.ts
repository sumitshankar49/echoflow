import { User } from '../../../database/entities/user.entity';

export type JournalMood = 'happy' | 'calm' | 'neutral' | 'anxious' | 'sad' | 'excited';

export class Journal {
  id!: string;

  title!: string;

  content!: string;

  mood!: JournalMood;

  tags!: string[];

  date!: Date;

  userId!: string;

  user?: User;

  createdAt!: Date;
}
