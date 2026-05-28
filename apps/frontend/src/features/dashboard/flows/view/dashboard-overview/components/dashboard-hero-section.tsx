import { CalendarClock, BookOpen, Music2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

import { RealTimeClock } from '@/components/common/RealTimeClock';
import type { DashboardUser } from '../types';

type DashboardHeroSectionProps = {
  me: DashboardUser | null | undefined;
  notesCount: number;
  topRemindersCount: number;
  activeCirclesCount: number;
  nextReminderTitle?: string;
  recentNoteTitle?: string;
  playlistName?: string;
};

export function DashboardHeroSection({
  me,
  notesCount,
  topRemindersCount,
  activeCirclesCount,
  nextReminderTitle,
  recentNoteTitle,
  playlistName,
}: DashboardHeroSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/85 p-6 text-white shadow-[0_28px_80px_-46px_rgba(15,23,42,0.9)] backdrop-blur-xl sm:p-8"
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(300px,360px)] xl:gap-7">
        <div className="space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200/20 bg-cyan-200/10 px-3 py-1 text-xs uppercase tracking-[0.28em] text-cyan-100/85">
            <Sparkles className="h-3.5 w-3.5" />
            Daily briefing
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Welcome back{me?.name ? `, ${me.name.split(' ')[0]}` : ''}. Your day is ready.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/70 sm:text-base">
              Stay in flow with your notes, reminders, circles, and music in one living dashboard built for calm momentum.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.2rem] border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-white/50">Notes</p>
              <p className="mt-2 text-3xl font-semibold">{notesCount}</p>
            </div>
            <div className="rounded-[1.2rem] border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-white/50">Upcoming</p>
              <p className="mt-2 text-3xl font-semibold">{topRemindersCount}</p>
            </div>
            <div className="rounded-[1.2rem] border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-white/50">Active circles</p>
              <p className="mt-2 text-3xl font-semibold">{activeCirclesCount}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 self-start">
          <RealTimeClock />

          <div className="relative overflow-hidden rounded-[1.8rem] border border-white/15 bg-gradient-to-br from-sky-400/20 via-indigo-400/10 to-transparent p-5">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full border border-white/15 bg-white/10" />
            <div className="absolute bottom-3 left-3 h-20 w-20 rounded-full border border-white/15 bg-cyan-200/15" />
            <div className="relative space-y-4">
              <p className="text-xs uppercase tracking-[0.24em] text-white/65">Today at a glance</p>
              <p className="text-2xl font-semibold">
                {new Date().toLocaleDateString(undefined, {
                  weekday: 'long',
                })}
              </p>
              <div className="space-y-2 text-sm leading-6 text-white/80">
                <p className="flex w-full items-start gap-2">
                  <CalendarClock className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{nextReminderTitle ? `Next: ${nextReminderTitle}` : 'No urgent reminders'}</span>
                </p>
                <p className="flex w-full items-start gap-2">
                  <BookOpen className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{recentNoteTitle ? `Recent note: ${recentNoteTitle}` : 'Capture your first note'}</span>
                </p>
                <p className="flex w-full items-start gap-2">
                  <Music2 className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{playlistName ? `${playlistName} ready` : 'Create a focus playlist'}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
