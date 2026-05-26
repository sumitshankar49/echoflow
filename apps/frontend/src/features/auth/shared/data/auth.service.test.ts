import { beforeEach, describe, expect, it, vi } from 'vitest';

import { authService } from './auth.service';
import { apiClient } from '@/shared/api/client';

vi.mock('@/shared/api/client', () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

const mockedApiClient = vi.mocked(apiClient);

describe('authService', () => {
  beforeEach(() => {
    mockedApiClient.post.mockReset();
    mockedApiClient.get.mockReset();
  });

  it('logs in with /auth/login and returns tokens', async () => {
    const tokens = { accessToken: 'access-token', refreshToken: 'refresh-token' };
    mockedApiClient.post.mockResolvedValue({ data: tokens });

    await expect(
      authService.login({ email: 'candy@example.com', password: 'StrongPass123!' }),
    ).resolves.toEqual(tokens);

    expect(mockedApiClient.post).toHaveBeenCalledWith('/auth/login', {
      email: 'candy@example.com',
      password: 'StrongPass123!',
    });
  });

  it('fetches current user with /auth/me', async () => {
    const user = { id: 'user-1', name: 'Candy User', email: 'candy@example.com' };
    mockedApiClient.get.mockResolvedValue({ data: user });

    await expect(authService.me()).resolves.toEqual(user);
    expect(mockedApiClient.get).toHaveBeenCalledWith('/auth/me');
  });

  it('refreshes token with /auth/refresh', async () => {
    const tokens = { accessToken: 'new-access-token', refreshToken: 'new-refresh-token' };
    mockedApiClient.post.mockResolvedValue({ data: tokens });

    await expect(authService.refresh('old-refresh-token')).resolves.toEqual(tokens);
    expect(mockedApiClient.post).toHaveBeenCalledWith('/auth/refresh', {
      refreshToken: 'old-refresh-token',
    });
  });

  it('registers with /auth/register', async () => {
    const user = {
      id: 'user-2',
      name: 'Candy',
      email: 'candy@example.com',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };
    mockedApiClient.post.mockResolvedValue({ data: user });

    await expect(
      authService.register({
        name: 'Candy',
        email: 'candy@example.com',
        password: 'StrongPass123!',
        confirmPassword: 'StrongPass123!',
        inviteCircleId: 'circle-1',
      }),
    ).resolves.toEqual(user);

    expect(mockedApiClient.post).toHaveBeenCalledWith('/auth/register', {
      name: 'Candy',
      email: 'candy@example.com',
      password: 'StrongPass123!',
      confirmPassword: 'StrongPass123!',
      inviteCircleId: 'circle-1',
    });
  });

  it('logs out with /auth/logout', async () => {
    const response = { message: 'Logged out' };
    mockedApiClient.post.mockResolvedValue({ data: response });

    await expect(authService.logout('refresh-token')).resolves.toEqual(response);
    expect(mockedApiClient.post).toHaveBeenCalledWith('/auth/logout', {
      refreshToken: 'refresh-token',
    });
  });

  it('sends forgot password request with /auth/forgot-password', async () => {
    const response = { message: 'Email sent' };
    mockedApiClient.post.mockResolvedValue({ data: response });

    await expect(authService.forgotPassword({ email: 'candy@example.com' })).resolves.toEqual(
      response,
    );
    expect(mockedApiClient.post).toHaveBeenCalledWith('/auth/forgot-password', {
      email: 'candy@example.com',
    });
  });

  it('resets password with /auth/reset-password', async () => {
    const response = { message: 'Password reset' };
    mockedApiClient.post.mockResolvedValue({ data: response });

    await expect(
      authService.resetPassword({
        email: 'candy@example.com',
        otp: '482915',
        newPassword: 'StrongPass123!',
        confirmPassword: 'StrongPass123!',
      }),
    ).resolves.toEqual(response);

    expect(mockedApiClient.post).toHaveBeenCalledWith('/auth/reset-password', {
      email: 'candy@example.com',
      otp: '482915',
      newPassword: 'StrongPass123!',
      confirmPassword: 'StrongPass123!',
    });
  });
});
