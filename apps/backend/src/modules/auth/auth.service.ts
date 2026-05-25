import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { randomBytes, createHash } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import type { StringValue } from 'ms';
import { Cron, CronExpression } from '@nestjs/schedule';
import type { User } from '../../generated/prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
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

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  private readonly safeUserSelect = {
    id: true,
    name: true,
    email: true,
    gender: true,
    dob: true,
    mobileNumber: true,
    relationshipStatus: true,
    createdAt: true,
    updatedAt: true,
  } as const;

  async register(registerDto: RegisterDto): Promise<Omit<User, 'password'>> {
    if (registerDto.password !== registerDto.confirmPassword) {
      throw new BadRequestException('Password and confirm password do not match');
    }

    const normalizedEmail = registerDto.email.toLowerCase();
    const existingUser = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      throw new BadRequestException('Email is already registered');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 12);

    const savedUser = await this.prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          name: registerDto.name,
          email: normalizedEmail,
          password: hashedPassword,
        },
      });

      if (registerDto.inviteCircleId) {
        const invitedCircle = await tx.circle.findUnique({
          where: { id: registerDto.inviteCircleId },
        });

        if (invitedCircle) {
          const existingMembership = await tx.circleMember.findUnique({
            where: {
              circleId_userId: {
                circleId: invitedCircle.id,
                userId: createdUser.id,
              },
            },
          });

          if (!existingMembership) {
            await tx.circleMember.create({
              data: {
                circleId: invitedCircle.id,
                userId: createdUser.id,
                role: 'member',
                status: 'accepted',
              },
            });
          }
        }
      }

      return createdUser;
    });

    const { password, ...safeUser } = savedUser;
    return safeUser;
  }

  async login(loginDto: LoginDto): Promise<TokenResponse> {
    const user = await this.prisma.user.findUnique({
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

    const isRevoked = await this.prisma.revokedToken.findUnique({
      where: { token: refreshTokenDto.refreshToken },
    });

    if (isRevoked) {
      throw new UnauthorizedException('Token has been revoked');
    }

    const user = await this.prisma.user.findUnique({
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

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<ForgotPasswordResponse> {
    const genericResponse = {
      message: 'If an account with that email exists, a reset link has been sent.',
    };

    const normalizedEmail = forgotPasswordDto.email.toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return genericResponse;
    }

    await this.prisma.passwordResetToken.deleteMany({
      where: {
        userId: user.id,
        usedAt: null,
      },
    });

    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
        usedAt: null,
      },
    });

    const resetPasswordUrl = this.configService.getOrThrow<string>('mail.resetPasswordUrl');
    const resetUrl = `${resetPasswordUrl}?token=${encodeURIComponent(rawToken)}`;

    await this.mailService.sendPasswordResetEmail(user.email, user.name, resetUrl);

    return genericResponse;
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<ResetPasswordResponse> {
    if (resetPasswordDto.newPassword !== resetPasswordDto.confirmPassword) {
      throw new BadRequestException('New password and confirm password do not match');
    }

    const tokenHash = this.hashToken(resetPasswordDto.token);
    const resetToken = await this.prisma.passwordResetToken.findFirst({
      where: {
        tokenHash,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (!resetToken) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: resetToken.userId },
      select: {
        id: true,
        password: true,
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: user.id },
        data: { password: await bcrypt.hash(resetPasswordDto.newPassword, 12) },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return { message: 'Password reset successfully' };
  }

  async logout(refreshTokenDto: RefreshTokenDto): Promise<LogoutResponse> {
    const refreshSecret = this.configService.getOrThrow<string>('jwt.refreshSecret');

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(
        refreshTokenDto.refreshToken,
        { secret: refreshSecret },
      );

      const existing = await this.prisma.revokedToken.findUnique({
        where: { token: refreshTokenDto.refreshToken },
      });

      if (!existing) {
        await this.prisma.revokedToken.create({
          data: {
            token: refreshTokenDto.refreshToken,
            expiresAt: new Date(payload.exp * 1000),
          },
        });
      }
    } catch {
      // Token is already invalid or expired — no need to blacklist
    }

    return { message: 'Logged out successfully' };
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupExpiredRevokedTokens(): Promise<void> {
    await this.prisma.revokedToken.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupExpiredPasswordResetTokens(): Promise<void> {
    await this.prisma.passwordResetToken.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });
  }

  async getMe(userId: string): Promise<Omit<User, 'password'>> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: this.safeUserSelect,
    });

    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }

    return user;
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

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
