import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from '../../database/entities/user.entity';
import { MailService } from '../mail/mail.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { RevokedToken } from './entities/revoked-token.entity';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
export interface JwtPayload {
    sub: string;
    email: string;
    name: string;
    tokenType: 'access' | 'refresh';
    exp: number;
}
export interface TokenResponse {
    accessToken: string;
    refreshToken: string;
}
export interface LogoutResponse {
    message: string;
}
export interface ForgotPasswordResponse {
    message: string;
}
export interface ResetPasswordResponse {
    message: string;
}
export declare class AuthService {
    private readonly usersRepository;
    private readonly revokedTokensRepository;
    private readonly passwordResetTokensRepository;
    private readonly jwtService;
    private readonly configService;
    private readonly mailService;
    constructor(usersRepository: Repository<User>, revokedTokensRepository: Repository<RevokedToken>, passwordResetTokensRepository: Repository<PasswordResetToken>, jwtService: JwtService, configService: ConfigService, mailService: MailService);
    register(registerDto: RegisterDto): Promise<Omit<User, 'password'>>;
    login(loginDto: LoginDto): Promise<TokenResponse>;
    refreshTokens(refreshTokenDto: RefreshTokenDto): Promise<TokenResponse>;
    forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<ForgotPasswordResponse>;
    resetPassword(resetPasswordDto: ResetPasswordDto): Promise<ResetPasswordResponse>;
    logout(refreshTokenDto: RefreshTokenDto): Promise<LogoutResponse>;
    cleanupExpiredRevokedTokens(): Promise<void>;
    cleanupExpiredPasswordResetTokens(): Promise<void>;
    getMe(userId: string): Promise<Omit<User, 'password'>>;
    private generateTokens;
    private hashToken;
}
