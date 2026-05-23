"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { AudioWaveform } from 'lucide-react';

import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { LoginForm } from '@/features/auth/flows/manage/login/login-form';
import {
  AUTH_LINK_PATHS,
  AUTH_LINK_TEXT,
} from '@/shared/constants';

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-6 sm:px-6 sm:py-8">
      <div className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(circle_at_20%_10%,rgba(139,92,246,0.35),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(99,102,241,0.28),transparent_38%),radial-gradient(circle_at_50%_90%,rgba(34,211,238,0.2),transparent_42%)] dark:bg-[radial-gradient(circle_at_20%_10%,rgba(124,58,237,0.34),transparent_42%),radial-gradient(circle_at_80%_0%,rgba(79,70,229,0.32),transparent_40%),radial-gradient(circle_at_50%_90%,rgba(8,145,178,0.24),transparent_46%)]" />

      <div className="pointer-events-none absolute inset-0 -z-10">
        <motion.div
          className="absolute inset-0 opacity-70"
          animate={{
            backgroundPosition: ['0% 0%', '100% 50%', '0% 0%'],
          }}
          transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
          style={{
            backgroundImage:
              'linear-gradient(125deg, rgba(124,58,237,0.14), rgba(99,102,241,0.12), rgba(34,211,238,0.1), rgba(139,92,246,0.14))',
            backgroundSize: '260% 260%',
          }}
        />

        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:42px_42px] opacity-[0.18] dark:opacity-[0.14]" />

        <motion.div
          className="absolute -left-16 top-24 h-52 w-52 rounded-full bg-violet-400/30 blur-3xl"
          animate={{ y: [0, -16, 12, 0], x: [0, 12, -10, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -right-16 bottom-12 h-56 w-56 rounded-full bg-cyan-400/25 blur-3xl"
          animate={{ y: [0, 12, -10, 0], x: [0, -10, 8, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />

        <motion.span
          className="absolute left-[14%] top-[26%] h-2 w-2 rounded-full bg-white/50"
          animate={{ y: [0, -14, 0], opacity: [0.25, 0.75, 0.25] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.span
          className="absolute right-[20%] top-[42%] h-2.5 w-2.5 rounded-full bg-indigo-100/55"
          animate={{ y: [0, 14, 0], opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
        />
        <motion.span
          className="absolute left-[22%] bottom-[20%] h-1.5 w-1.5 rounded-full bg-cyan-100/65"
          animate={{ y: [0, -10, 0], opacity: [0.25, 0.75, 0.25] }}
          transition={{ duration: 4.6, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <Card className="border-white/35 bg-white/78 shadow-[0_30px_70px_-32px_rgba(79,70,229,0.6)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/68 dark:shadow-[0_30px_75px_-30px_rgba(79,70,229,0.68)]">
          <CardContent className="space-y-6 p-5 sm:p-7">
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-500 text-white shadow-lg shadow-violet-500/35">
                <AudioWaveform className="h-7 w-7" />
              </div>
              <div className="space-y-1.5">
                <p className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">EchoFlow</p>
                <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Welcome Back</h1>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Your personal memory companion</p>
              </div>
            </div>

            <LoginForm />

            <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
              {AUTH_LINK_TEXT.NEW_HERE}{' '}
              <Link
                href={AUTH_LINK_PATHS.REGISTER}
                className="font-semibold text-indigo-600 underline-offset-4 transition hover:underline dark:text-indigo-300"
              >
                {AUTH_LINK_TEXT.REGISTER}
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </main>
  );
}
