import { describe, expectTypeOf, it } from 'vitest';

import type {
  AuthTokens,
  AuthUser,
  ForgotPasswordPayload,
  LoginPayload,
  MessageResponse,
  RegisterPayload,
  ResetPasswordPayload,
} from './auth.types';

describe('auth.types', () => {
  it('defines login and register payload shapes', () => {
    expectTypeOf<LoginPayload>().toEqualTypeOf<{
      email: string;
      password: string;
    }>();

    expectTypeOf<RegisterPayload>().toEqualTypeOf<{
      name: string;
      email: string;
      password: string;
      confirmPassword: string;
      inviteCircleId?: string;
    }>();
  });

  it('defines auth token and user response shapes', () => {
    expectTypeOf<AuthTokens>().toEqualTypeOf<{
      accessToken: string;
      refreshToken: string;
    }>();

    expectTypeOf<AuthUser>().toEqualTypeOf<{
      id: string;
      name: string;
      email: string;
      gender?: string | null;
      dob?: string | null;
      mobileNumber?: string | null;
      relationshipStatus?: string | null;
      createdAt: string;
      updatedAt: string;
    }>();
  });

  it('defines forgot/reset password and message response shapes', () => {
    expectTypeOf<ForgotPasswordPayload>().toEqualTypeOf<{
      email: string;
    }>();

    expectTypeOf<ResetPasswordPayload>().toEqualTypeOf<{
      email: string;
      otp: string;
      newPassword: string;
      confirmPassword: string;
    }>();

    expectTypeOf<MessageResponse>().toEqualTypeOf<{
      message: string;
    }>();
  });
});
