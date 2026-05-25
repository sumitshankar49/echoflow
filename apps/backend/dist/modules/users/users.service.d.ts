import type { User } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
export interface PasswordChangeResponse {
    message: string;
}
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private readonly safeUserSelect;
    getMe(userId: string): Promise<Omit<User, 'password'>>;
    updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<Omit<User, 'password'>>;
    changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<PasswordChangeResponse>;
}
