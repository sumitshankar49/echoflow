import { describe, expect, it } from 'vitest';

import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from './auth.schema';

describe('auth.schema', () => {
  it('validates login payload', () => {
    expect(() =>
      loginSchema.parse({
        email: 'candy@example.com',
        password: 'StrongPass123!',
      }),
    ).not.toThrow();
  });

  it('rejects register payload with non-matching passwords', () => {
    const result = registerSchema.safeParse({
      name: 'Candy',
      email: 'candy@example.com',
      password: 'StrongPass123!',
      confirmPassword: 'Mismatch123!',
    });

    expect(result.success).toBe(false);
  });

  it('validates forgot password payload', () => {
    expect(() => forgotPasswordSchema.parse({ email: 'candy@example.com' })).not.toThrow();
  });

  it('rejects reset payload when otp is invalid', () => {
    const result = resetPasswordSchema.safeParse({
      email: 'candy@example.com',
      otp: '12',
      newPassword: 'StrongPass123!',
      confirmPassword: 'StrongPass123!',
    });

    expect(result.success).toBe(false);
  });
});
