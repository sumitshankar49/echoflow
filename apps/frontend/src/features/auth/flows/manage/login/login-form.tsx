'use client';

import { useLoginForm } from './use-login-form';

export function LoginForm() {
  const { form, onSubmit } = useLoginForm();
  const { register, formState: { errors } } = form;

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Email</label>
        <input
          type="email"
          className="w-full rounded-lg border px-3 py-2 text-sm"
          {...register('email')}
        />
        {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Password</label>
        <input
          type="password"
          className="w-full rounded-lg border px-3 py-2 text-sm"
          {...register('password')}
        />
        {errors.password && (
          <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
        )}
      </div>
      <button
        type="submit"
        className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
      >
        Sign in
      </button>
    </form>
  );
}
