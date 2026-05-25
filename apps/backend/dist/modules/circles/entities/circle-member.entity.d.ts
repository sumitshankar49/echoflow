import { User } from '../../../database/entities/user.entity';
import { Circle } from './circle.entity';
export declare class CircleMember {
    id: string;
    circleId: string;
    userId: string;
    role: string;
    status: string;
    circle?: Circle;
    user?: User;
    createdAt: Date;
    updatedAt: Date;
}
