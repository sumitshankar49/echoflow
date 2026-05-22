import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../database/entities/user.entity';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { PasswordChangeResponse, UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getMe(currentUser: AuthenticatedUser): Promise<Omit<User, 'password'>>;
    updateProfile(updateProfileDto: UpdateProfileDto, currentUser: AuthenticatedUser): Promise<Omit<User, 'password'>>;
    changePassword(changePasswordDto: ChangePasswordDto, currentUser: AuthenticatedUser): Promise<PasswordChangeResponse>;
}
