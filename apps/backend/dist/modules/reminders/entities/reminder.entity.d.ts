import { User } from '../../../database/entities/user.entity';
export declare class Reminder {
    id: string;
    title: string;
    description: string | null;
    expiresAt: Date;
    isCompleted: boolean;
    userId: string;
    user: User;
    createdAt: Date;
    updatedAt: Date;
}
