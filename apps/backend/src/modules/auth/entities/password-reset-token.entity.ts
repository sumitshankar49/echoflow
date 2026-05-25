import { User } from '../../../database/entities/user.entity';

export class PasswordResetToken {
  id!: string;

  userId!: string;

  tokenHash!: string;

  expiresAt!: Date;

  usedAt!: Date | null;

  createdAt!: Date;

  user?: User;
}