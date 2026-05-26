/// <reference types="jest" />

import { Test, TestingModule } from '@nestjs/testing';

import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

describe('AuthController', () => {
  let controller: AuthController;

  const authServiceMock = {
    getMe: jest.fn(),
    register: jest.fn(),
    login: jest.fn(),
    refreshTokens: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
    logout: jest.fn(),
  };

  const currentUser: AuthenticatedUser = {
    userId: 'user-id',
    email: 'candy@example.com',
    name: 'Candy User',
    tokenType: 'access',
  };

  const registerDto: RegisterDto = {
    name: 'Candy User',
    email: 'candy@example.com',
    password: 'StrongPass123!',
    confirmPassword: 'StrongPass123!',
  };

  const loginDto: LoginDto = {
    email: 'candy@example.com',
    password: 'StrongPass123!',
  };

  const refreshTokenDto: RefreshTokenDto = {
    refreshToken: 'refresh-token',
  };

  const forgotPasswordDto: ForgotPasswordDto = {
    email: 'candy@example.com',
  };

  const resetPasswordDto: ResetPasswordDto = {
    token: 'reset-token',
    newPassword: 'NewStrongPass123!',
    confirmPassword: 'NewStrongPass123!',
  };

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('is defined', () => {
    expect(controller).toBeDefined();
  });

  it('forwards getMe to the auth service', async () => {
    const response = {
      id: 'user-id',
      name: 'Candy User',
      email: 'candy@example.com',
      createdAt: new Date('2026-05-26T00:00:00.000Z'),
      updatedAt: new Date('2026-05-26T00:00:00.000Z'),
    };
    authServiceMock.getMe.mockResolvedValue(response);

    await expect(controller.getMe(currentUser)).resolves.toEqual(response);
    expect(authServiceMock.getMe).toHaveBeenCalledWith('user-id');
  });

  it('forwards register to the auth service', async () => {
    const response = {
      id: 'user-id',
      name: 'Candy User',
      email: 'candy@example.com',
      createdAt: new Date('2026-05-26T00:00:00.000Z'),
      updatedAt: new Date('2026-05-26T00:00:00.000Z'),
    };
    authServiceMock.register.mockResolvedValue(response);

    await expect(controller.register(registerDto)).resolves.toEqual(response);
    expect(authServiceMock.register).toHaveBeenCalledWith(registerDto);
  });

  it('forwards login to the auth service', async () => {
    const response = {
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    };
    authServiceMock.login.mockResolvedValue(response);

    await expect(controller.login(loginDto)).resolves.toEqual(response);
    expect(authServiceMock.login).toHaveBeenCalledWith(loginDto);
  });

  it('forwards refresh to the auth service', async () => {
    const response = {
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    };
    authServiceMock.refreshTokens.mockResolvedValue(response);

    await expect(controller.refresh(refreshTokenDto)).resolves.toEqual(response);
    expect(authServiceMock.refreshTokens).toHaveBeenCalledWith(refreshTokenDto);
  });

  it('forwards forgotPassword to the auth service', async () => {
    const response = {
      message: 'If an account with that email exists, a reset link has been sent.',
    };
    authServiceMock.forgotPassword.mockResolvedValue(response);

    await expect(controller.forgotPassword(forgotPasswordDto)).resolves.toEqual(response);
    expect(authServiceMock.forgotPassword).toHaveBeenCalledWith(forgotPasswordDto);
  });

  it('forwards resetPassword to the auth service', async () => {
    const response = {
      message: 'Password reset successfully',
    };
    authServiceMock.resetPassword.mockResolvedValue(response);

    await expect(controller.resetPassword(resetPasswordDto)).resolves.toEqual(response);
    expect(authServiceMock.resetPassword).toHaveBeenCalledWith(resetPasswordDto);
  });

  it('forwards logout to the auth service', async () => {
    const response = {
      message: 'Logged out successfully',
    };
    authServiceMock.logout.mockResolvedValue(response);

    await expect(controller.logout(refreshTokenDto)).resolves.toEqual(response);
    expect(authServiceMock.logout).toHaveBeenCalledWith(refreshTokenDto);
  });
});