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
import { LoginForm } from '@/features/auth/flows/manage/login/login-form';
import {
  AUTH_LINK_PATHS,
  AUTH_LINK_TEXT,
  AUTH_PAGE_DESCRIPTIONS,
  AUTH_PAGE_TITLES,
} from '@/shared/constants';

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,#a5b4fc_0%,transparent_40%),radial-gradient(circle_at_bottom_left,#99f6e4_0%,transparent_35%)] dark:bg-[radial-gradient(circle_at_top_right,#3730a3_0%,transparent_45%),radial-gradient(circle_at_bottom_left,#155e75_0%,transparent_40%)]" />

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader className="space-y-2">
            <CardTitle>{AUTH_PAGE_TITLES.LOGIN}</CardTitle>
            <CardDescription>
              {AUTH_PAGE_DESCRIPTIONS.LOGIN}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <LoginForm />

            <div className="flex items-center justify-between text-sm">
              <Link href={AUTH_LINK_PATHS.FORGOT_PASSWORD} className="font-medium text-zinc-600 underline underline-offset-4 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
                {AUTH_LINK_TEXT.FORGOT_PASSWORD}
              </Link>
              <p className="text-zinc-600 dark:text-zinc-400">
                {AUTH_LINK_TEXT.NEW_HERE}{' '}
                <Link href={AUTH_LINK_PATHS.REGISTER} className="font-semibold text-zinc-900 underline underline-offset-4 dark:text-zinc-100">
                  {AUTH_LINK_TEXT.REGISTER}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </main>
  );
}
