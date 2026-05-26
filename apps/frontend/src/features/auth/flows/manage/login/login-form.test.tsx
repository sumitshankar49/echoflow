import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  useLoginForm: vi.fn(),
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
    button: ({ children, whileTap, whileHover, transition, ...props }: any) => (
      <button {...props}>{children}</button>
    ),
    span: ({ children, initial, animate, exit, transition, ...props }: any) => (
      <span {...props}>{children}</span>
    ),
  },
}));

vi.mock('@/components/common/ButtonLoader', () => ({
  ButtonLoader: ({ label }: { label: string }) => <span>{label}</span>,
}));

vi.mock('./use-login-form', () => ({
  useLoginForm: mocks.useLoginForm,
}));

import { LoginForm } from './login-form';
import { AUTH_BUTTON_LABELS } from '@/shared/constants';

function makeFormState(options?: {
  isSubmitting?: boolean;
  emailError?: string;
  passwordError?: string;
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
          ...(options?.emailError ? { email: { message: options.emailError } } : {}),
          ...(options?.passwordError
            ? { password: { message: options.passwordError } }
            : {}),
        },
      },
    },
    onSubmit: mocks.onSubmit,
    isSubmitting: Boolean(options?.isSubmitting),
  };
}

describe('LoginForm', () => {
  it('toggles password visibility and submits', () => {
    mocks.useLoginForm.mockReturnValue(makeFormState());

    const { container } = render(<LoginForm />);

    expect(screen.getByLabelText('Show password')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Show password'));
    expect(screen.getByLabelText('Hide password')).toBeInTheDocument();

    fireEvent.submit(container.querySelector('form')!);
    expect(mocks.onSubmit).toHaveBeenCalled();
  });

  it('renders errors and submitting UI', () => {
    mocks.useLoginForm.mockReturnValue(
      makeFormState({
        isSubmitting: true,
        emailError: 'Invalid email',
        passwordError: 'Invalid password',
      }),
    );

    render(<LoginForm />);

    expect(screen.getByText('Invalid email')).toBeInTheDocument();
    expect(screen.getByText('Invalid password')).toBeInTheDocument();
    expect(screen.getByText(AUTH_BUTTON_LABELS.SIGNING_IN)).toBeInTheDocument();
    expect(screen.getByText(/Thinking... Signing you in with a secure session/i)).toBeInTheDocument();
  });
});
