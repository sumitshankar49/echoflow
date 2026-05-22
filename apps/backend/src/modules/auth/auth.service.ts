import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import type { StringValue } from 'ms';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LessThan, Repository } from 'typeorm';

import { User } from '../../database/entities/user.entity';
import { RevokedToken } from './entities/revoked-token.entity';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';

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

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(RevokedToken)
    private readonly revokedTokensRepository: Repository<RevokedToken>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<Omit<User, 'password'>> {
    const existingUser = await this.usersRepository.findOne({
      where: { email: registerDto.email.toLowerCase() },
    });

    if (existingUser) {
      throw new BadRequestException('Email is already registered');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 12);

    const user = this.usersRepository.create({
      name: registerDto.name,
      email: registerDto.email.toLowerCase(),
      password: hashedPassword,
    });

    const savedUser = await this.usersRepository.save(user);

    const { password, ...safeUser } = savedUser;
    return safeUser;
  }

  async login(loginDto: LoginDto): Promise<TokenResponse> {
    const user = await this.usersRepository.findOne({
      where: { email: loginDto.email.toLowerCase() },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.generateTokens(user);
  }

  async refreshTokens(refreshTokenDto: RefreshTokenDto): Promise<TokenResponse> {
    const refreshSecret = this.configService.getOrThrow<string>('jwt.refreshSecret');

    let payload: JwtPayload;

    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(
        refreshTokenDto.refreshToken,
        {
          secret: refreshSecret,
        },
      );
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (payload.tokenType !== 'refresh') {
      throw new UnauthorizedException('Invalid token type');
    }

    const isRevoked = await this.revokedTokensRepository.findOne({
      where: { token: refreshTokenDto.refreshToken },
    });

    if (isRevoked) {
      throw new UnauthorizedException('Token has been revoked');
    }

    const user = await this.usersRepository.findOne({
      where: { id: payload.sub },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }

    return this.generateTokens(user);
  }

  async logout(refreshTokenDto: RefreshTokenDto): Promise<LogoutResponse> {
    const refreshSecret = this.configService.getOrThrow<string>('jwt.refreshSecret');

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(
        refreshTokenDto.refreshToken,
        { secret: refreshSecret },
      );

      const existing = await this.revokedTokensRepository.findOne({
        where: { token: refreshTokenDto.refreshToken },
      });

      if (!existing) {
        const revokedToken = this.revokedTokensRepository.create({
          token: refreshTokenDto.refreshToken,
          expiresAt: new Date(payload.exp * 1000),
        });
        await this.revokedTokensRepository.save(revokedToken);
      }
    } catch {
      // Token is already invalid or expired — no need to blacklist
    }

    return { message: 'Logged out successfully' };
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupExpiredRevokedTokens(): Promise<void> {
    await this.revokedTokensRepository.delete({
      expiresAt: LessThan(new Date()),
    });
  }

  async getMe(userId: string): Promise<Omit<User, 'password'>> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }

    const { password, ...safeUser } = user;
    return safeUser;
  }

  private async generateTokens(user: Pick<User, 'id' | 'email' | 'name'>): Promise<TokenResponse> {
    const accessSecret = this.configService.getOrThrow<string>('jwt.accessSecret');
    const accessExpiresIn = this.configService.getOrThrow<StringValue>('jwt.accessExpiresIn');
    const refreshSecret = this.configService.getOrThrow<string>('jwt.refreshSecret');
    const refreshExpiresIn = this.configService.getOrThrow<StringValue>('jwt.refreshExpiresIn');

    const basePayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { ...basePayload, tokenType: 'access' },
        {
          secret: accessSecret,
          expiresIn: accessExpiresIn,
        },
      ),
      this.jwtService.signAsync(
        { ...basePayload, tokenType: 'refresh' },
        {
          secret: refreshSecret,
          expiresIn: refreshExpiresIn,
        },
      ),
    ]);

    return { accessToken, refreshToken };
  }
}
