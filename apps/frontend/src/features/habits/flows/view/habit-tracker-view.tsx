'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Flame, Plus, Target, TrendingUp, Zap } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useHabitList } from './use-habits';
import { HabitCard } from './habit-card';
import { AddHabitModal } from './add-habit-modal';

// ─── Stats strip ───────────────────────────────────────────────────────────────

function StatsStrip({ habits }: { habits: ReturnType<typeof useHabitList>['data'] }) {
  if (!habits?.length) return null;

  const completedToday = habits.filter((h) => h.completedToday).length;
  const totalHabits = habits.length;
  const topStreak = Math.max(...habits.map((h) => h.currentStreak));
  const totalCompletions = habits.reduce((s, h) => s + h.totalCompletions, 0);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {[
        {
          icon: <Target className="h-4 w-4" />,
          label: 'Done Today',
          value: `${completedToday} / ${totalHabits}`,
          color: 'text-emerald-400',
          bg: 'bg-emerald-500/10',
        },
        {
          icon: <Flame className="h-4 w-4" />,
          label: 'Top Streak',
          value: `${topStreak} days`,
          color: 'text-orange-400',
          bg: 'bg-orange-500/10',
          pulse: topStreak >= 7,
        },
        {
          icon: <TrendingUp className="h-4 w-4" />,
          label: 'Completions',
          value: totalCompletions.toLocaleString(),
          color: 'text-violet-400',
          bg: 'bg-violet-500/10',
        },
        {
          icon: <Zap className="h-4 w-4" />,
          label: 'Habits Tracked',
          value: totalHabits,
          color: 'text-sky-400',
          bg: 'bg-sky-500/10',
        },
      ].map(({ icon, label, value, color, bg, pulse }) => (
        <motion.div
          key={label}
          className="flex flex-col gap-1 rounded-2xl border border-white/6 bg-white/[0.03] p-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${bg} ${color}`}>
            {pulse ? (
              <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 0.9, repeat: Infinity }}>
                {icon}
              </motion.div>
            ) : icon}
          </div>
          <p className="mt-1 text-xl font-bold text-white">{value}</p>
          <p className="text-[11px] text-white/40">{label}</p>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <motion.div
      className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-white/10 bg-white/[0.02] py-16 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      <motion.div
        className="text-6xl"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        🌱
      </motion.div>
      <div>
        <p className="text-lg font-semibold text-white/80">No habits yet</p>
        <p className="mt-1 text-sm text-white/40">Start small. Stay consistent. Watch yourself grow.</p>
      </div>
      <Button
        onClick={onAdd}
        className="mt-2 gap-2 bg-violet-600 text-white hover:bg-violet-500"
      >
        <Plus className="h-4 w-4" />
        Add your first habit
      </Button>
    </motion.div>
  );
}

// ─── Main View ─────────────────────────────────────────────────────────────────

export function HabitTrackerView() {
  const { data: habits, isLoading, isError } = useHabitList();
  const [addOpen, setAddOpen] = useState(false);

  const activeHabits = habits?.filter((h) => !h.isArchived) ?? [];
  const todayProgress = activeHabits.length > 0
    ? Math.round((activeHabits.filter((h) => h.completedToday).length / activeHabits.length) * 100)
    : 0;

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      {/* Background gradient orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-orange-900/20 blur-[120px]" />
        <div className="absolute -right-20 top-1/3 h-80 w-80 rounded-full bg-violet-900/15 blur-[100px]" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-amber-900/10 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-2xl px-4 py-8">
        {/* Header */}
        <motion.div
          className="mb-8 flex items-start justify-between"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="text-3xl">🔥</span>
              <h1 className="text-3xl font-extrabold tracking-tight text-white">HabitFlow</h1>
            </div>
            <p className="mt-1 text-sm text-white/40">
              {activeHabits.length > 0
                ? `${activeHabits.filter((h) => h.completedToday).length} of ${activeHabits.length} habits done today`
                : 'A smooth and modern space for your daily rituals'}
            </p>
          </div>

          <Button
            onClick={() => setAddOpen(true)}
            className="gap-2 bg-violet-600 text-white shadow-lg shadow-violet-900/40 hover:bg-violet-500"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Habit</span>
          </Button>
        </motion.div>

        {/* Daily progress bar */}
        {activeHabits.length > 0 && (
          <motion.div
            className="mb-6 rounded-2xl border border-white/6 bg-white/[0.03] p-4"
            initial={{ opacity: 0, scaleX: 0.95 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium text-white/70">Today's Progress</span>
              <motion.span
                className="font-bold text-white"
                animate={todayProgress === 100 ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.4 }}
              >
                {todayProgress}%
              </motion.span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-white/8">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: todayProgress === 100
                    ? 'linear-gradient(90deg, #f97316, #fb923c)'
                    : 'linear-gradient(90deg, #7c3aed, #8b5cf6)',
                }}
                initial={{ width: 0 }}
                animate={{ width: `${todayProgress}%` }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
              />
            </div>
            {todayProgress === 100 && (
              <motion.p
                className="mt-2 text-center text-xs font-semibold text-orange-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                🎉 Perfect day! All habits completed!
              </motion.p>
            )}
          </motion.div>
        )}

        {/* Stats grid */}
        {activeHabits.length > 0 && (
          <div className="mb-6">
            <StatsStrip habits={activeHabits} />
          </div>
        )}

        {/* Habit list */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="h-20 animate-pulse rounded-2xl bg-white/5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.08 }}
              />
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center text-red-400">
            Failed to load habits. Please refresh.
          </div>
        ) : activeHabits.length === 0 ? (
          <EmptyState onAdd={() => setAddOpen(true)} />
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="space-y-3">
              {/* Sort: incomplete first, then by streak */}
              {[...activeHabits]
                .sort((a, b) => {
                  if (a.completedToday !== b.completedToday) return a.completedToday ? 1 : -1;
                  return b.currentStreak - a.currentStreak;
                })
                .map((habit) => (
                  <HabitCard key={habit.id} habit={habit} />
                ))}
            </div>
          </AnimatePresence>
        )}

        {/* Motivational footer */}
        {activeHabits.length > 0 && (
          <motion.p
            className="mt-8 text-center text-xs text-white/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            "We are what we repeatedly do. Excellence, then, is not an act, but a habit." — Aristotle
          </motion.p>
        )}
      </div>

      <AddHabitModal open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}
