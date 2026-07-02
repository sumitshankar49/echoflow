"use client";

import Link from 'next/link';
import { Suspense } from 'react';

import { AuthShell } from '@/components/common/AuthShell';
import { RegisterForm } from '@/features/auth/flows/manage/register/register-form';
import {
  AUTH_LINK_PATHS,
  AUTH_LINK_TEXT,
} from '@/shared/constants';

export default function RegisterPage() {
  return (
    <AuthShell
      title="Create Your Account"
      description="Your personal memory companion"
      footer={
        <p className="text-center text-sm text-muted-foreground">
          {AUTH_LINK_TEXT.ALREADY_HAVE_ACCOUNT}{' '}
          <Link
            href={AUTH_LINK_PATHS.LOGIN}
            className="font-semibold text-primary underline-offset-4 transition hover:underline"
          >
            {AUTH_LINK_TEXT.SIGN_IN}
          </Link>
        </p>
      }
    >
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading...</p>}>
        <RegisterForm />
      </Suspense>
    </AuthShell>
  );
}
