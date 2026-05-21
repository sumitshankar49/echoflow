'use client';

import { useRegisterForm } from './use-register-form';

export function RegisterForm() {
  const { form, onSubmit } = useRegisterForm();
  const { register, formState: { errors } } = form;

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Name</label>
        <input
          className="w-full rounded-lg border px-3 py-2 text-sm"
          {...register('name')}
        />
        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
      </div>
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
        Create account
      </button>
    </form>
  );
}
