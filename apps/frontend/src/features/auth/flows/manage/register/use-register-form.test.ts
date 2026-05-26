import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  register: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
  searchParamGet: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mocks.push,
  }),
  useSearchParams: () => ({
    get: mocks.searchParamGet,
  }),
}));

vi.mock('@/features/auth/shared/data/auth.service', () => ({
  authService: {
    register: mocks.register,
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
import { useRegisterForm } from './use-register-form';

describe('useRegisterForm', () => {
  beforeEach(() => {
    mocks.push.mockReset();
    mocks.register.mockReset();
    mocks.toastSuccess.mockReset();
    mocks.toastError.mockReset();
    mocks.searchParamGet.mockReset();
  });

  it('uses invite params and submits successfully', async () => {
    mocks.searchParamGet.mockImplementation((key: string) => {
      if (key === 'inviteCircleId') return 'circle-1';
      if (key === 'inviteEmail') return 'invite@example.com';
      return null;
    });
    mocks.register.mockResolvedValue({ id: 'u-1' });

    const { result } = renderHook(() => useRegisterForm());

    expect(result.current.form.getValues('email')).toBe('invite@example.com');

    await act(async () => {
      result.current.form.setValue('name', 'Candy');
      result.current.form.setValue('email', 'invite@example.com');
      result.current.form.setValue('password', 'StrongPass123!');
      result.current.form.setValue('confirmPassword', 'StrongPass123!');
    });

    await act(async () => {
      await result.current.onSubmit();
    });

    expect(mocks.register).toHaveBeenCalledWith({
      name: 'Candy',
      email: 'invite@example.com',
      password: 'StrongPass123!',
      confirmPassword: 'StrongPass123!',
      inviteCircleId: 'circle-1',
    });
    expect(mocks.toastSuccess).toHaveBeenCalledWith(AUTH_TOAST_MESSAGES.REGISTER_SUCCESS);
    expect(mocks.push).toHaveBeenCalledWith(`${AUTH_LINK_PATHS.LOGIN}?email=invite%40example.com`);
  });

  it('falls back to empty invite values when params are absent', async () => {
    mocks.searchParamGet.mockReturnValue(null);
    mocks.register.mockResolvedValue({ id: 'u-1' });

    const { result } = renderHook(() => useRegisterForm());

    expect(result.current.form.getValues('email')).toBe('');

    await act(async () => {
      result.current.form.setValue('name', 'Candy');
      result.current.form.setValue('email', 'candy@example.com');
      result.current.form.setValue('password', 'StrongPass123!');
      result.current.form.setValue('confirmPassword', 'StrongPass123!');
    });

    await act(async () => {
      await result.current.onSubmit();
    });

    expect(mocks.register).toHaveBeenCalledWith({
      name: 'Candy',
      email: 'candy@example.com',
      password: 'StrongPass123!',
      confirmPassword: 'StrongPass123!',
      inviteCircleId: undefined,
    });
  });

  it('shows API message when register fails with axios error', async () => {
    mocks.searchParamGet.mockReturnValue(null);
    mocks.register.mockRejectedValue({
      isAxiosError: true,
      response: { data: { message: 'Email already exists' } },
    });

    const { result } = renderHook(() => useRegisterForm());

    await act(async () => {
      result.current.form.setValue('name', 'Candy');
      result.current.form.setValue('email', 'candy@example.com');
      result.current.form.setValue('password', 'StrongPass123!');
      result.current.form.setValue('confirmPassword', 'StrongPass123!');
    });

    await act(async () => {
      await result.current.onSubmit();
    });

    expect(mocks.toastError).toHaveBeenCalledWith('Email already exists');
  });

  it('shows fallback error for non-axios failure', async () => {
    mocks.searchParamGet.mockReturnValue(null);
    mocks.register.mockRejectedValue(new Error('boom'));

    const { result } = renderHook(() => useRegisterForm());

    await act(async () => {
      result.current.form.setValue('name', 'Candy');
      result.current.form.setValue('email', 'candy@example.com');
      result.current.form.setValue('password', 'StrongPass123!');
      result.current.form.setValue('confirmPassword', 'StrongPass123!');
    });

    await act(async () => {
      await result.current.onSubmit();
    });

    expect(mocks.toastError).toHaveBeenCalledWith(AUTH_ERROR_MESSAGES.REGISTER_FAILED);
  });

  it('falls back when axios error has no API message', async () => {
    mocks.searchParamGet.mockReturnValue(null);
    mocks.register.mockRejectedValue({
      isAxiosError: true,
      response: { data: {} },
    });

    const { result } = renderHook(() => useRegisterForm());

    await act(async () => {
      result.current.form.setValue('name', 'Candy');
      result.current.form.setValue('email', 'candy@example.com');
      result.current.form.setValue('password', 'StrongPass123!');
      result.current.form.setValue('confirmPassword', 'StrongPass123!');
    });

    await act(async () => {
      await result.current.onSubmit();
    });

    expect(mocks.toastError).toHaveBeenCalledWith(AUTH_ERROR_MESSAGES.REGISTER_FAILED);
  });
});
