import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  useForgotPasswordForm: vi.fn(),
  onSubmit: vi.fn((e?: Event) => e?.preventDefault?.()),
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

vi.mock('./use-forgot-password-form', () => ({
  useForgotPasswordForm: mocks.useForgotPasswordForm,
}));

import { ForgotPasswordForm } from './forgot-password-form';
import { AUTH_BUTTON_LABELS } from '@/shared/constants';

function makeFormState(options?: { isSubmitting?: boolean; error?: string }) {
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
        errors: options?.error ? { email: { message: options.error } } : {},
      },
    },
    onSubmit: mocks.onSubmit,
    isSubmitting: Boolean(options?.isSubmitting),
  };
}

describe('ForgotPasswordForm', () => {
  it('renders default state and submits form', () => {
    mocks.useForgotPasswordForm.mockReturnValue(makeFormState());

    const { container } = render(<ForgotPasswordForm />);

    expect(screen.getByText(AUTH_BUTTON_LABELS.SEND_RESET_LINK)).toBeInTheDocument();
    fireEvent.submit(container.querySelector('form')!);
    expect(mocks.onSubmit).toHaveBeenCalled();
  });

  it('renders error and submitting helper state', () => {
    mocks.useForgotPasswordForm.mockReturnValue(
      makeFormState({ isSubmitting: true, error: 'Email is required' }),
    );

    render(<ForgotPasswordForm />);

    expect(screen.getByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText(AUTH_BUTTON_LABELS.SENDING_RESET_LINK)).toBeInTheDocument();
    expect(screen.getByText(/Sending a secure OTP to your inbox/i)).toBeInTheDocument();
  });
});
