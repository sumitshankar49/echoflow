import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  resetPassword: vi.fn(),
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
    resetPassword: mocks.resetPassword,
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: mocks.toastSuccess,
    error: mocks.toastError,
  },
}));

import {
  AUTH_ERROR_MESSAGES,
  AUTH_LINK_PATHS,
  AUTH_TOAST_MESSAGES,
} from '@/shared/constants';
import { useResetPasswordForm } from './use-reset-password-form';

describe('useResetPasswordForm', () => {
  beforeEach(() => {
    mocks.push.mockReset();
    mocks.resetPassword.mockReset();
    mocks.toastSuccess.mockReset();
    mocks.toastError.mockReset();
  });

  it('submits successfully and redirects to login', async () => {
    mocks.resetPassword.mockResolvedValue({ message: 'ok' });

    const { result } = renderHook(() => useResetPasswordForm('candy@example.com'));

    expect(result.current.form.getValues('email')).toBe('candy@example.com');

    await act(async () => {
      result.current.form.setValue('otp', '482915');
      result.current.form.setValue('newPassword', 'StrongPass123!');
      result.current.form.setValue('confirmPassword', 'StrongPass123!');
    });

    await act(async () => {
      await result.current.onSubmit();
    });

    expect(mocks.resetPassword).toHaveBeenCalledWith({
      email: 'candy@example.com',
      otp: '482915',
      newPassword: 'StrongPass123!',
      confirmPassword: 'StrongPass123!',
    });
    expect(mocks.toastSuccess).toHaveBeenCalledWith(AUTH_TOAST_MESSAGES.RESET_PASSWORD_SUCCESS);
    expect(mocks.push).toHaveBeenCalledWith(AUTH_LINK_PATHS.LOGIN);
  });

  it('uses empty email default when missing', () => {
    const { result } = renderHook(() => useResetPasswordForm(null));
    expect(result.current.form.getValues('email')).toBe('');
  });

  it('shows invalid-link message for otp-related API errors', async () => {
    mocks.resetPassword.mockRejectedValue({
      isAxiosError: true,
      response: { data: { message: 'OTP expired' } },
    });

    const { result } = renderHook(() => useResetPasswordForm('candy@example.com'));

    await act(async () => {
      result.current.form.setValue('otp', '482915');
      result.current.form.setValue('newPassword', 'StrongPass123!');
      result.current.form.setValue('confirmPassword', 'StrongPass123!');
    });

    await act(async () => {
      await result.current.onSubmit();
    });

    expect(mocks.toastError).toHaveBeenCalledWith(AUTH_ERROR_MESSAGES.RESET_PASSWORD_INVALID_LINK);
  });

  it('shows generic message for unrelated failures', async () => {
    mocks.resetPassword.mockRejectedValue(new Error('boom'));

    const { result } = renderHook(() => useResetPasswordForm('candy@example.com'));

    await act(async () => {
      result.current.form.setValue('otp', '482915');
      result.current.form.setValue('newPassword', 'StrongPass123!');
      result.current.form.setValue('confirmPassword', 'StrongPass123!');
    });

    await act(async () => {
      await result.current.onSubmit();
    });

    expect(mocks.toastError).toHaveBeenCalledWith(AUTH_ERROR_MESSAGES.RESET_PASSWORD_FAILED);
  });
});
