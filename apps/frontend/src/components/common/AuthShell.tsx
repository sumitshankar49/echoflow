"use client";

import type { PropsWithChildren, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { AudioWaveform } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';

interface AuthShellProps extends PropsWithChildren {
  title: string;
  description: string;
  footer?: ReactNode;
}

export function AuthShell({ title, description, footer, children }: AuthShellProps) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-6 sm:px-6 sm:py-8">
      <div className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(circle_at_15%_4%,rgba(99,102,241,0.28),transparent_36%),radial-gradient(circle_at_82%_3%,rgba(129,140,248,0.24),transparent_34%),radial-gradient(circle_at_50%_88%,rgba(56,189,248,0.16),transparent_42%)] dark:bg-[radial-gradient(circle_at_15%_4%,rgba(99,102,241,0.26),transparent_40%),radial-gradient(circle_at_82%_3%,rgba(129,140,248,0.2),transparent_36%),radial-gradient(circle_at_50%_88%,rgba(14,165,233,0.2),transparent_42%)]" />

      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgba(99,102,241,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.08)_1px,transparent_1px)] bg-[size:42px_42px] opacity-50" />

      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <Card className="border-border/80 bg-card/88 backdrop-blur-2xl">
          <CardContent className="space-y-6 p-6 sm:p-7">
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-sky-500 text-white shadow-lg shadow-indigo-500/30">
                <AudioWaveform className="h-7 w-7" />
              </div>
              <div className="space-y-1.5">
                <p className="text-2xl font-semibold tracking-tight text-foreground">EchoFlow</p>
                <h1 className="text-xl font-semibold text-foreground">{title}</h1>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            </div>

            {children}
            {footer}
          </CardContent>
        </Card>
      </motion.div>
    </main>
  );
}
