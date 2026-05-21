import { User } from '../../../database/entities/user.entity';
import { Circle } from './circle.entity';
export type CircleMemberRole = 'owner' | 'member';
export type CircleMemberStatus = 'invited' | 'accepted';
export declare class CircleMember {
    id: string;
    circleId: string;
    circle: Circle;
    userId: string;
    user: User;
    role: CircleMemberRole;
    status: CircleMemberStatus;
    createdAt: Date;
    updatedAt: Date;
}
