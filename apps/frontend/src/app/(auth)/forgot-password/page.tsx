"use client";

import Link from 'next/link';

import { AuthShell } from '@/components/common/AuthShell';
import { ForgotPasswordForm } from '@/features/auth/flows/manage/forgot-password/forgot-password-form';
import {
  AUTH_LINK_PATHS,
  AUTH_LINK_TEXT,
  AUTH_PAGE_DESCRIPTIONS,
  AUTH_PAGE_TITLES,
} from '@/shared/constants';

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title={AUTH_PAGE_TITLES.FORGOT_PASSWORD}
      description={AUTH_PAGE_DESCRIPTIONS.FORGOT_PASSWORD}
      footer={
        <p className="text-center text-sm text-muted-foreground">
          {AUTH_LINK_TEXT.BACK_TO}{' '}
          <Link href={AUTH_LINK_PATHS.LOGIN} className="font-semibold text-primary underline underline-offset-4">
            {AUTH_LINK_TEXT.SIGN_IN}
          </Link>
        </p>
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}