import { User } from '../../../database/entities/user.entity';

export type MemorySourceType = 'note' | 'journal' | 'task';

export class Memory {
  id!: string;

  title!: string;

  content!: string;

  sourceType!: MemorySourceType;

  sourceId!: string | null;

  tags!: string[];

  importanceScore!: number;

  userId!: string;

  user?: User;

  createdAt!: Date;

  updatedAt!: Date;
}
