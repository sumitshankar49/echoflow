import { AuthService } from './auth.service';
import type { ForgotPasswordResponse, LogoutResponse, ResetPasswordResponse, TokenResponse } from './auth.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { User } from '../../database/entities/user.entity';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    getMe(currentUser: AuthenticatedUser): Promise<Omit<User, 'password'>>;
    register(registerDto: RegisterDto): Promise<Omit<User, 'password'>>;
    login(loginDto: LoginDto): Promise<TokenResponse>;
    refresh(refreshTokenDto: RefreshTokenDto): Promise<TokenResponse>;
    forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<ForgotPasswordResponse>;
    resetPassword(resetPasswordDto: ResetPasswordDto): Promise<ResetPasswordResponse>;
    logout(refreshTokenDto: RefreshTokenDto): Promise<LogoutResponse>;
}
