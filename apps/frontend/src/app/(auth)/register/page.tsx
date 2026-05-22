"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { RegisterForm } from '@/features/auth/flows/manage/register/register-form';
import {
  AUTH_LINK_PATHS,
  AUTH_LINK_TEXT,
  AUTH_PAGE_DESCRIPTIONS,
  AUTH_PAGE_TITLES,
} from '@/shared/constants';

export default function RegisterPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,#c4b5fd_0%,transparent_38%),radial-gradient(circle_at_bottom_right,#86efac_0%,transparent_35%)] dark:bg-[radial-gradient(circle_at_top_left,#581c87_0%,transparent_45%),radial-gradient(circle_at_bottom_right,#14532d_0%,transparent_40%)]" />

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader className="space-y-2">
            <CardTitle>{AUTH_PAGE_TITLES.REGISTER}</CardTitle>
            <CardDescription>
              {AUTH_PAGE_DESCRIPTIONS.REGISTER}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <RegisterForm />

            <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
              {AUTH_LINK_TEXT.ALREADY_HAVE_ACCOUNT}{' '}
              <Link href={AUTH_LINK_PATHS.LOGIN} className="font-semibold text-zinc-900 underline underline-offset-4 dark:text-zinc-100">
                {AUTH_LINK_TEXT.SIGN_IN}
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </main>
  );
}
