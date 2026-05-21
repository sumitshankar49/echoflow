import { User } from '../../../database/entities/user.entity';
export declare class Playlist {
    id: string;
    name: string;
    description: string | null;
    coverUrl: string | null;
    isPublic: boolean;
    userId: string;
    user: User;
    createdAt: Date;
    updatedAt: Date;
}
