import { User } from '../../../database/entities/user.entity';
export declare class PasswordResetToken {
    id: string;
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    usedAt: Date | null;
    createdAt: Date;
    user: User;
}
