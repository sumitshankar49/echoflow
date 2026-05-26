import { renderHook, act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  login: vi.fn(),
  setTokens: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mocks.push,
  }),
}));

vi.mock('@/features/auth/shared/data/auth.service', () => ({
  authService: {
    login: mocks.login,
  },
}));

vi.mock('@/shared/store/auth.store', () => ({
  useAuthStore: (selector: (state: { setTokens: typeof mocks.setTokens }) => unknown) =>
    selector({
      setTokens: mocks.setTokens,
    }),
}));

vi.mock('sonner', () => ({
  toast: {
    success: mocks.toastSuccess,
    error: mocks.toastError,
  },
}));

import { useLoginForm } from './use-login-form';
import { AUTH_ERROR_MESSAGES, AUTH_TOAST_MESSAGES } from '@/shared/constants';

describe('useLoginForm', () => {
  beforeEach(() => {
    mocks.push.mockReset();
    mocks.login.mockReset();
    mocks.setTokens.mockReset();
    mocks.toastSuccess.mockReset();
    mocks.toastError.mockReset();
  });

  it('logs in successfully and redirects to dashboard', async () => {
    mocks.login.mockResolvedValue({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });

    const { result } = renderHook(() => useLoginForm());

    await act(async () => {
      result.current.form.setValue('email', 'candy@example.com');
      result.current.form.setValue('password', 'StrongPass123!');
    });

    await act(async () => {
      await result.current.onSubmit();
    });

    expect(mocks.login).toHaveBeenCalledWith({
      email: 'candy@example.com',
      password: 'StrongPass123!',
    });
    expect(mocks.setTokens).toHaveBeenCalledWith('access-token', 'refresh-token');
    expect(mocks.toastSuccess).toHaveBeenCalledWith(AUTH_TOAST_MESSAGES.LOGIN_SUCCESS);
    expect(mocks.push).toHaveBeenCalledWith('/dashboard');
  });

  it('shows api error message when login fails', async () => {
    mocks.login.mockRejectedValue({
      isAxiosError: true,
      response: {
        data: {
          message: 'Invalid email or password',
        },
      },
    });

    const { result } = renderHook(() => useLoginForm());

    await act(async () => {
      result.current.form.setValue('email', 'candy@example.com');
      result.current.form.setValue('password', 'StrongPass123!');
    });

    await act(async () => {
      await result.current.onSubmit();
    });

    expect(mocks.toastError).toHaveBeenCalledWith('Invalid email or password');
    expect(mocks.push).not.toHaveBeenCalled();
  });

  it('shows fallback error message for non-axios failures', async () => {
    mocks.login.mockRejectedValue(new Error('boom'));

    const { result } = renderHook(() => useLoginForm());

    await act(async () => {
      result.current.form.setValue('email', 'candy@example.com');
      result.current.form.setValue('password', 'StrongPass123!');
    });

    await act(async () => {
      await result.current.onSubmit();
    });

    expect(mocks.toastError).toHaveBeenCalledWith(AUTH_ERROR_MESSAGES.LOGIN_FAILED);
  });

  it('falls back when axios error has no API message', async () => {
    mocks.login.mockRejectedValue({
      isAxiosError: true,
      response: {
        data: {},
      },
    });

    const { result } = renderHook(() => useLoginForm());

    await act(async () => {
      result.current.form.setValue('email', 'candy@example.com');
      result.current.form.setValue('password', 'StrongPass123!');
    });

    await act(async () => {
      await result.current.onSubmit();
    });

    expect(mocks.toastError).toHaveBeenCalledWith(AUTH_ERROR_MESSAGES.LOGIN_FAILED);
  });
});
