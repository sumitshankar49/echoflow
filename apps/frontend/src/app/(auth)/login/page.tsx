"use client";

import Link from 'next/link';

import { AuthShell } from '@/components/common/AuthShell';
import { LoginForm } from '@/features/auth/flows/manage/login/login-form';
import {
  AUTH_LINK_PATHS,
  AUTH_LINK_TEXT,
} from '@/shared/constants';

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome Back"
      description="Your personal memory companion"
      footer={
        <p className="text-center text-sm text-muted-foreground">
          {AUTH_LINK_TEXT.NEW_HERE}{' '}
          <Link
            href={AUTH_LINK_PATHS.REGISTER}
            className="font-semibold text-primary underline-offset-4 transition hover:underline"
          >
            {AUTH_LINK_TEXT.REGISTER}
          </Link>
        </p>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}
