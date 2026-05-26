import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  useResetPasswordForm: vi.fn(),
  onSubmit: vi.fn((e?: Event) => e?.preventDefault?.()),
}));

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('framer-motion', () => ({
  motion: {
    form: ({ children, initial, animate, transition, ...props }: any) => (
      <form {...props}>{children}</form>
    ),
    div: ({ children, whileHover, whileTap, transition, ...props }: any) => (
      <div {...props}>{children}</div>
    ),
    p: ({ children, initial, animate, transition, ...props }: any) => (
      <p {...props}>{children}</p>
    ),
  },
}));

vi.mock('@/components/common/ButtonLoader', () => ({
  ButtonLoader: ({ label }: { label: string }) => <span>{label}</span>,
}));

vi.mock('./use-reset-password-form', () => ({
  useResetPasswordForm: mocks.useResetPasswordForm,
}));

import { ResetPasswordForm } from './reset-password-form';
import { AUTH_BUTTON_LABELS, AUTH_ERROR_MESSAGES } from '@/shared/constants';

function makeFormState(options?: {
  isSubmitting?: boolean;
  otpError?: string;
  newPasswordError?: string;
  confirmPasswordError?: string;
}) {
  const register = vi.fn((name: string) => ({
    name,
    onChange: vi.fn(),
    onBlur: vi.fn(),
    ref: vi.fn(),
  }));

  return {
    form: {
      register,
      formState: {
        errors: {
          ...(options?.otpError ? { otp: { message: options.otpError } } : {}),
          ...(options?.newPasswordError
            ? { newPassword: { message: options.newPasswordError } }
            : {}),
          ...(options?.confirmPasswordError
            ? { confirmPassword: { message: options.confirmPasswordError } }
            : {}),
        },
      },
    },
    onSubmit: mocks.onSubmit,
    isSubmitting: Boolean(options?.isSubmitting),
  };
}

describe('ResetPasswordForm', () => {
  it('renders missing-link warning when email is absent and toggles rules', () => {
    mocks.useResetPasswordForm.mockReturnValue(makeFormState());

    render(<ResetPasswordForm email={null} />);

    expect(screen.getByText(/Email is missing for OTP reset/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Password rules/i }));
    expect(screen.getByText(/Use a strong password with/i)).toBeInTheDocument();
  });

  it('renders errors and submitting UI and submits', () => {
    mocks.useResetPasswordForm.mockReturnValue(
      makeFormState({
        isSubmitting: true,
        otpError: 'Invalid OTP',
        newPasswordError: 'Weak password',
        confirmPasswordError: 'Mismatch',
      }),
    );

    const { container } = render(<ResetPasswordForm email="candy@example.com" />);

    expect(screen.getByText('Invalid OTP')).toBeInTheDocument();
    expect(screen.getByText('Weak password')).toBeInTheDocument();
    expect(screen.getByText('Mismatch')).toBeInTheDocument();
    expect(screen.getByText(AUTH_BUTTON_LABELS.RESETTING_PASSWORD)).toBeInTheDocument();
    expect(screen.getByText(/Updating your password and securing your account/i)).toBeInTheDocument();

    fireEvent.submit(container.querySelector('form')!);
    expect(mocks.onSubmit).toHaveBeenCalled();
  });
});
