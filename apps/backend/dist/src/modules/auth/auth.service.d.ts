import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from '../../database/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
export interface JwtPayload {
    sub: string;
    email: string;
    name: string;
    tokenType: 'access' | 'refresh';
}
export interface TokenResponse {
    accessToken: string;
    refreshToken: string;
}
export interface LogoutResponse {
    message: string;
}
export declare class AuthService {
    private readonly usersRepository;
    private readonly jwtService;
    private readonly configService;
    constructor(usersRepository: Repository<User>, jwtService: JwtService, configService: ConfigService);
    register(registerDto: RegisterDto): Promise<Omit<User, 'password'>>;
    login(loginDto: LoginDto): Promise<TokenResponse>;
    refreshTokens(refreshTokenDto: RefreshTokenDto): Promise<TokenResponse>;
    logout(_refreshTokenDto: RefreshTokenDto): Promise<LogoutResponse>;
    private generateTokens;
}
