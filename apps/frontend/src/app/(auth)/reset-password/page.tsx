"use client";

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { AuthShell } from '@/components/common/AuthShell';
import { ResetPasswordForm } from '@/features/auth/flows/manage/reset-password/reset-password-form';
import {
  AUTH_LINK_PATHS,
  AUTH_LINK_TEXT,
  AUTH_PAGE_DESCRIPTIONS,
  AUTH_PAGE_TITLES,
} from '@/shared/constants';

function ResetPasswordPageContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') ?? undefined;

  return <ResetPasswordPageLayout email={email} />;
}

function ResetPasswordPageLayout({ email }: { email?: string }) {
  return (
    <AuthShell
      title={AUTH_PAGE_TITLES.RESET_PASSWORD}
      description={AUTH_PAGE_DESCRIPTIONS.RESET_PASSWORD}
      footer={
        <p className="text-center text-sm text-muted-foreground">
          {AUTH_LINK_TEXT.BACK_TO}{' '}
          <Link href={AUTH_LINK_PATHS.LOGIN} className="font-semibold text-primary underline underline-offset-4">
            {AUTH_LINK_TEXT.SIGN_IN}
          </Link>
        </p>
      }
    >
      <ResetPasswordForm email={email} />
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordPageLayout />}>
      <ResetPasswordPageContent />
    </Suspense>
  );
}