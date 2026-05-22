import { Repository } from 'typeorm';
import { User } from '../../database/entities/user.entity';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
export interface PasswordChangeResponse {
    message: string;
}
export declare class UsersService {
    private readonly usersRepository;
    constructor(usersRepository: Repository<User>);
    getMe(userId: string): Promise<Omit<User, 'password'>>;
    updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<Omit<User, 'password'>>;
    changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<PasswordChangeResponse>;
}
