import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  useRegisterForm: vi.fn(),
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

vi.mock('./use-register-form', () => ({
  useRegisterForm: mocks.useRegisterForm,
}));

import { RegisterForm } from './register-form';
import { AUTH_BUTTON_LABELS } from '@/shared/constants';

function makeFormState(options?: {
  isSubmitting?: boolean;
  nameError?: string;
  emailError?: string;
  passwordError?: string;
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
          ...(options?.nameError ? { name: { message: options.nameError } } : {}),
          ...(options?.emailError ? { email: { message: options.emailError } } : {}),
          ...(options?.passwordError ? { password: { message: options.passwordError } } : {}),
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

describe('RegisterForm', () => {
  it('toggles password visibility and password rules', () => {
    mocks.useRegisterForm.mockReturnValue(makeFormState());

    const { container } = render(<RegisterForm />);

    fireEvent.click(screen.getByLabelText('Show password'));
    expect(screen.getByLabelText('Hide password')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Show confirm password'));
    expect(screen.getByLabelText('Hide confirm password')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Password rules/i }));
    expect(screen.getByText(/Use a strong password with/i)).toBeInTheDocument();

    fireEvent.submit(container.querySelector('form')!);
    expect(mocks.onSubmit).toHaveBeenCalled();
  });

  it('renders errors and submitting UI', () => {
    mocks.useRegisterForm.mockReturnValue(
      makeFormState({
        isSubmitting: true,
        nameError: 'Name required',
        emailError: 'Email required',
        passwordError: 'Weak password',
        confirmPasswordError: 'Passwords do not match',
      }),
    );

    render(<RegisterForm />);

    expect(screen.getByText('Name required')).toBeInTheDocument();
    expect(screen.getByText('Email required')).toBeInTheDocument();
    expect(screen.getByText('Weak password')).toBeInTheDocument();
    expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    expect(screen.getByText(AUTH_BUTTON_LABELS.CREATING_ACCOUNT)).toBeInTheDocument();
    expect(screen.getByText(/Creating your personalized EchoFlow workspace/i)).toBeInTheDocument();
  });
});
