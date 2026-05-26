/// <reference types="jest" />

import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcryptjs';

import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;

  const hashMock = bcrypt.hash as jest.MockedFunction<typeof bcrypt.hash>;
  const compareMock = bcrypt.compare as jest.MockedFunction<typeof bcrypt.compare>;

  const prismaMock = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    revokedToken: {
      findUnique: jest.fn(),
      create: jest.fn(),
      deleteMany: jest.fn(),
    },
    passwordResetToken: {
      deleteMany: jest.fn(),
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const jwtServiceMock = {
    verifyAsync: jest.fn(),
    signAsync: jest.fn(),
  };

  const configServiceMock = {
    getOrThrow: jest.fn(),
  };

  const mailServiceMock = {
    sendPasswordResetEmail: jest.fn(),
    sendPasswordResetOtpEmail: jest.fn(),
    sendCircleInviteEmail: jest.fn(),
  };

  const registerDto: RegisterDto = {
    name: 'Candy User',
    email: 'Candy@Example.com',
    password: 'StrongPass123!',
    confirmPassword: 'StrongPass123!',
  };

  const loginDto = {
    email: 'Candy@Example.com',
    password: 'StrongPass123!',
  };

  const refreshTokenDto = {
    refreshToken: 'refresh-token-value',
  };

  const baseUser = {
    id: 'user-id',
    name: 'Candy User',
    email: 'candy@example.com',
    createdAt: new Date('2026-05-26T00:00:00.000Z'),
    updatedAt: new Date('2026-05-26T00:00:00.000Z'),
  };

  const tokenPair = {
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
  };

  beforeEach(async () => {
    jest.resetAllMocks();

    configServiceMock.getOrThrow.mockImplementation((key: string) => {
      const values: Record<string, string> = {
        'jwt.accessSecret': 'access-secret',
        'jwt.accessExpiresIn': '15m',
        'jwt.refreshSecret': 'refresh-secret',
        'jwt.refreshExpiresIn': '7d',
        'mail.resetPasswordUrl': 'http://localhost:3000/reset-password',
      };

      if (!(key in values)) {
        throw new Error(`Missing config for ${key}`);
      }

      return values[key];
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
        {
          provide: JwtService,
          useValue: jwtServiceMock,
        },
        {
          provide: ConfigService,
          useValue: configServiceMock,
        },
        {
          provide: MailService,
          useValue: mailServiceMock,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  const createRegisterTxMock = () => ({
    user: {
      create: jest.fn().mockResolvedValue({
        ...baseUser,
        password: 'hashed-password',
      }),
    },
    circle: {
      findUnique: jest.fn(),
    },
    circleMember: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  });

  describe('register', () => {
    it('throws when password confirmation does not match', async () => {
      await expect(
        service.register({
          ...registerDto,
          confirmPassword: 'Mismatch123!',
        }),
      ).rejects.toThrow(new BadRequestException('Password and confirm password do not match'));

      expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
    });

    it('throws when the email is already registered', async () => {
      prismaMock.user.findUnique.mockResolvedValue({ id: 'existing-user-id' });

      await expect(service.register(registerDto)).rejects.toThrow(
        new BadRequestException('Email is already registered'),
      );

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'candy@example.com' },
      });
    });

    it('creates a user and returns the safe user payload', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      const txMock = createRegisterTxMock();

      prismaMock.$transaction.mockImplementation(
        async (callback: (tx: typeof txMock) => Promise<unknown>) => callback(txMock),
      );

      hashMock.mockImplementation(async () => 'hashed-password');

      await expect(service.register(registerDto)).resolves.toEqual(baseUser);

      expect(hashMock).toHaveBeenCalledWith('StrongPass123!', 12);
      expect(txMock.user.create).toHaveBeenCalledWith({
        data: {
          name: 'Candy User',
          email: 'candy@example.com',
          password: 'hashed-password',
        },
      });
      expect(txMock.circle.findUnique).not.toHaveBeenCalled();
    });

    it('adds the user to an invited circle when one exists', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      const txMock = createRegisterTxMock();
      txMock.circle.findUnique.mockResolvedValue({ id: 'circle-id' });
      txMock.circleMember.findUnique.mockResolvedValue(null);

      prismaMock.$transaction.mockImplementation(
        async (callback: (tx: typeof txMock) => Promise<unknown>) => callback(txMock),
      );

      hashMock.mockImplementation(async () => 'hashed-password');

      await service.register({
        ...registerDto,
        inviteCircleId: 'circle-id',
      });

      expect(txMock.circle.findUnique).toHaveBeenCalledWith({
        where: { id: 'circle-id' },
      });
      expect(txMock.circleMember.findUnique).toHaveBeenCalledWith({
        where: {
          circleId_userId: {
            circleId: 'circle-id',
            userId: 'user-id',
          },
        },
      });
      expect(txMock.circleMember.create).toHaveBeenCalledWith({
        data: {
          circleId: 'circle-id',
          userId: 'user-id',
          role: 'member',
          status: 'accepted',
        },
      });
    });
  });

  describe('login', () => {
    it('throws when the user is not found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        new UnauthorizedException('Invalid email or password'),
      );

      expect(compareMock).not.toHaveBeenCalled();
    });

    it('throws when the password is invalid', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        ...baseUser,
        password: 'hashed-password',
      });
      compareMock.mockImplementation(async () => false);

      await expect(service.login(loginDto)).rejects.toThrow(
        new UnauthorizedException('Invalid email or password'),
      );
    });

    it('returns tokens for valid credentials', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        ...baseUser,
        password: 'hashed-password',
      });
      compareMock.mockImplementation(async () => true);
      jwtServiceMock.signAsync
        .mockResolvedValueOnce(tokenPair.accessToken)
        .mockResolvedValueOnce(tokenPair.refreshToken);

      await expect(service.login(loginDto)).resolves.toEqual(tokenPair);

      expect(compareMock).toHaveBeenCalledWith('StrongPass123!', 'hashed-password');
      expect(jwtServiceMock.signAsync).toHaveBeenNthCalledWith(
        1,
        {
          sub: 'user-id',
          email: 'candy@example.com',
          name: 'Candy User',
          tokenType: 'access',
        },
        {
          secret: 'access-secret',
          expiresIn: '15m',
        },
      );
      expect(jwtServiceMock.signAsync).toHaveBeenNthCalledWith(
        2,
        {
          sub: 'user-id',
          email: 'candy@example.com',
          name: 'Candy User',
          tokenType: 'refresh',
        },
        {
          secret: 'refresh-secret',
          expiresIn: '7d',
        },
      );
    });
  });

  describe('refreshTokens', () => {
    it('throws when refresh token verification fails', async () => {
      jwtServiceMock.verifyAsync.mockRejectedValue(new Error('invalid'));

      await expect(service.refreshTokens(refreshTokenDto)).rejects.toThrow(
        new UnauthorizedException('Invalid refresh token'),
      );
    });

    it('throws when token type is not refresh', async () => {
      jwtServiceMock.verifyAsync.mockResolvedValue({
        sub: 'user-id',
        email: 'candy@example.com',
        name: 'Candy User',
        tokenType: 'access',
        exp: Math.floor(Date.now() / 1000) + 3600,
      });

      await expect(service.refreshTokens(refreshTokenDto)).rejects.toThrow(
        new UnauthorizedException('Invalid token type'),
      );
    });

    it('throws when the refresh token has been revoked', async () => {
      jwtServiceMock.verifyAsync.mockResolvedValue({
        sub: 'user-id',
        email: 'candy@example.com',
        name: 'Candy User',
        tokenType: 'refresh',
        exp: Math.floor(Date.now() / 1000) + 3600,
      });
      prismaMock.revokedToken.findUnique.mockResolvedValue({ id: 'revoked-id' });

      await expect(service.refreshTokens(refreshTokenDto)).rejects.toThrow(
        new UnauthorizedException('Token has been revoked'),
      );
    });

    it('returns a new token pair for a valid refresh token', async () => {
      jwtServiceMock.verifyAsync.mockResolvedValue({
        sub: 'user-id',
        email: 'candy@example.com',
        name: 'Candy User',
        tokenType: 'refresh',
        exp: Math.floor(Date.now() / 1000) + 3600,
      });
      prismaMock.revokedToken.findUnique.mockResolvedValue(null);
      prismaMock.user.findUnique.mockResolvedValue(baseUser);
      jwtServiceMock.signAsync
        .mockResolvedValueOnce(tokenPair.accessToken)
        .mockResolvedValueOnce(tokenPair.refreshToken);

      await expect(service.refreshTokens(refreshTokenDto)).resolves.toEqual(tokenPair);

      expect(prismaMock.revokedToken.findUnique).toHaveBeenCalledWith({
        where: { token: 'refresh-token-value' },
      });
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-id' },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });
  });

  describe('forgotPassword', () => {
    it('returns a generic message when the user is not found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(
        service.forgotPassword({ email: 'missing@example.com' }),
      ).resolves.toEqual({
        message: 'If an account with that email exists, a password reset OTP has been sent.',
      });

      expect(prismaMock.passwordResetToken.deleteMany).not.toHaveBeenCalled();
      expect(mailServiceMock.sendPasswordResetOtpEmail).not.toHaveBeenCalled();
    });

    it('creates a reset token and sends an email for an existing user', async () => {
      prismaMock.user.findUnique.mockResolvedValue(baseUser);
      prismaMock.passwordResetToken.deleteMany.mockResolvedValue({ count: 1 });
      prismaMock.passwordResetToken.create.mockResolvedValue({ id: 'reset-token-id' });

      await expect(
        service.forgotPassword({ email: 'Candy@Example.com' }),
      ).resolves.toEqual({
        message: 'If an account with that email exists, a password reset OTP has been sent.',
      });

      expect(prismaMock.passwordResetToken.deleteMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-id',
          usedAt: null,
        },
      });
      expect(prismaMock.passwordResetToken.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'user-id',
          tokenHash: expect.any(String),
          expiresAt: expect.any(Date),
          usedAt: null,
        }),
      });
      expect(mailServiceMock.sendPasswordResetOtpEmail).toHaveBeenCalledWith(
        'candy@example.com',
        'Candy User',
        expect.stringMatching(/^\d{6}$/),
      );
    });
  });

  describe('resetPassword', () => {
    it('throws when new password confirmation does not match', async () => {
      await expect(
        service.resetPassword({
          email: 'candy@example.com',
          otp: '482915',
          newPassword: 'NewStrongPass123!',
          confirmPassword: 'Mismatch123!',
        }),
      ).rejects.toThrow(new BadRequestException('New password and confirm password do not match'));
    });

    it('throws when OTP is invalid or expired', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-id',
      });
      prismaMock.passwordResetToken.findFirst.mockResolvedValue(null);

      await expect(
        service.resetPassword({
          email: 'candy@example.com',
          otp: '482915',
          newPassword: 'NewStrongPass123!',
          confirmPassword: 'NewStrongPass123!',
        }),
      ).rejects.toThrow(new BadRequestException('Invalid or expired OTP'));
    });

    it('updates the password and marks the reset token as used', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-id',
      });
      prismaMock.passwordResetToken.findFirst.mockResolvedValue({
        id: 'reset-token-id',
        userId: 'user-id',
      });
      prismaMock.user.update.mockResolvedValue({ id: 'user-id' });
      prismaMock.passwordResetToken.update.mockResolvedValue({ id: 'reset-token-id' });
      prismaMock.$transaction.mockImplementation(async (operations: Promise<unknown>[]) =>
        Promise.all(operations),
      );
      hashMock.mockImplementation(async () => 'new-hash');

      await expect(
        service.resetPassword({
          email: 'candy@example.com',
          otp: '482915',
          newPassword: 'NewStrongPass123!',
          confirmPassword: 'NewStrongPass123!',
        }),
      ).resolves.toEqual({ message: 'Password reset successfully' });

      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: 'user-id' },
        data: { password: 'new-hash' },
      });
      expect(prismaMock.passwordResetToken.update).toHaveBeenCalledWith({
        where: { id: 'reset-token-id' },
        data: { usedAt: expect.any(Date) },
      });
    });

    it('throws when email does not map to a user', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(
        service.resetPassword({
          email: 'missing@example.com',
          otp: '482915',
          newPassword: 'NewStrongPass123!',
          confirmPassword: 'NewStrongPass123!',
        }),
      ).rejects.toThrow(new BadRequestException('Invalid or expired OTP'));
    });
  });

  describe('logout', () => {
    it('returns success even when the refresh token is invalid', async () => {
      jwtServiceMock.verifyAsync.mockRejectedValue(new Error('invalid'));

      await expect(service.logout(refreshTokenDto)).resolves.toEqual({
        message: 'Logged out successfully',
      });

      expect(prismaMock.revokedToken.create).not.toHaveBeenCalled();
    });

    it('stores the refresh token when it is not already revoked', async () => {
      jwtServiceMock.verifyAsync.mockResolvedValue({
        sub: 'user-id',
        email: 'candy@example.com',
        name: 'Candy User',
        tokenType: 'refresh',
        exp: 1_800_000_000,
      });
      prismaMock.revokedToken.findUnique.mockResolvedValue(null);

      await expect(service.logout(refreshTokenDto)).resolves.toEqual({
        message: 'Logged out successfully',
      });

      expect(prismaMock.revokedToken.create).toHaveBeenCalledWith({
        data: {
          token: 'refresh-token-value',
          expiresAt: new Date(1_800_000_000 * 1000),
        },
      });
    });
  });

  describe('cleanup jobs', () => {
    it('removes expired revoked tokens', async () => {
      prismaMock.revokedToken.deleteMany.mockResolvedValue({ count: 1 });

      await service.cleanupExpiredRevokedTokens();

      expect(prismaMock.revokedToken.deleteMany).toHaveBeenCalledWith({
        where: {
          expiresAt: { lt: expect.any(Date) },
        },
      });
    });

    it('removes expired password reset tokens', async () => {
      prismaMock.passwordResetToken.deleteMany.mockResolvedValue({ count: 1 });

      await service.cleanupExpiredPasswordResetTokens();

      expect(prismaMock.passwordResetToken.deleteMany).toHaveBeenCalledWith({
        where: {
          expiresAt: { lt: expect.any(Date) },
        },
      });
    });
  });

  describe('getMe', () => {
    it('throws when the user no longer exists', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(service.getMe('missing-user-id')).rejects.toThrow(
        new UnauthorizedException('User no longer exists'),
      );
    });

    it('returns the safe user profile', async () => {
      prismaMock.user.findUnique.mockResolvedValue(baseUser);

      await expect(service.getMe('user-id')).resolves.toEqual(baseUser);

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-id' },
        select: {
          id: true,
          name: true,
          email: true,
          gender: true,
          dob: true,
          mobileNumber: true,
          relationshipStatus: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });
  });
});