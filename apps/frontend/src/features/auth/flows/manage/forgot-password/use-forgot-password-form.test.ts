import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  forgotPassword: vi.fn(),
  push: vi.fn(),
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
    forgotPassword: mocks.forgotPassword,
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: mocks.toastSuccess,
    error: mocks.toastError,
  },
}));

import { AUTH_ERROR_MESSAGES, AUTH_TOAST_MESSAGES } from '@/shared/constants';
import { useForgotPasswordForm } from './use-forgot-password-form';

describe('useForgotPasswordForm', () => {
  beforeEach(() => {
    mocks.forgotPassword.mockReset();
    mocks.push.mockReset();
    mocks.toastSuccess.mockReset();
    mocks.toastError.mockReset();
  });

  it('submits successfully and resets the form', async () => {
    mocks.forgotPassword.mockResolvedValue({ message: 'ok' });

    const { result } = renderHook(() => useForgotPasswordForm());
    const resetSpy = vi.spyOn(result.current.form, 'reset');

    await act(async () => {
      result.current.form.setValue('email', 'candy@example.com');
    });

    await act(async () => {
      await result.current.onSubmit();
    });

    expect(mocks.forgotPassword).toHaveBeenCalledWith({ email: 'candy@example.com' });
    expect(mocks.toastSuccess).toHaveBeenCalledWith(AUTH_TOAST_MESSAGES.FORGOT_PASSWORD_SUCCESS);
    expect(resetSpy).toHaveBeenCalled();
    expect(mocks.push).toHaveBeenCalledWith('/reset-password?email=candy%40example.com');
  });

  it('shows rate limit error for status 429', async () => {
    mocks.forgotPassword.mockRejectedValue({
      isAxiosError: true,
      response: { status: 429 },
    });

    const { result } = renderHook(() => useForgotPasswordForm());

    await act(async () => {
      result.current.form.setValue('email', 'candy@example.com');
    });

    await act(async () => {
      await result.current.onSubmit();
    });

    expect(mocks.toastError).toHaveBeenCalledWith(AUTH_ERROR_MESSAGES.FORGOT_PASSWORD_RATE_LIMIT);
  });

  it('shows fallback error for non-rate-limit failures', async () => {
    mocks.forgotPassword.mockRejectedValue(new Error('boom'));

    const { result } = renderHook(() => useForgotPasswordForm());

    await act(async () => {
      result.current.form.setValue('email', 'candy@example.com');
    });

    await act(async () => {
      await result.current.onSubmit();
    });

    expect(mocks.toastError).toHaveBeenCalledWith(AUTH_ERROR_MESSAGES.FORGOT_PASSWORD_FAILED);
  });
});
