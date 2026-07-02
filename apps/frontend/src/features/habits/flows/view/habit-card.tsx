'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown, ChevronUp, Flame, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useCheckIn, useDeleteHabit, useHabitLogs, useUndoCheckIn } from './use-habits';
import { HabitHeatmap } from './habit-heatmap';
import type { HabitWithStats } from '../../shared/domain/habits.types';

// ─── Progress Ring ─────────────────────────────────────────────────────────────

const RING_R = 22;
const RING_C = 2 * Math.PI * RING_R;

function ProgressRing({ progress, color }: { progress: number; color: string }) {
  const offset = RING_C * (1 - Math.min(1, progress / 100));
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" style={{ transform: 'rotate(-90deg)' }}>
      <circle cx="28" cy="28" r={RING_R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
      <motion.circle
        cx="28"
        cy="28"
        r={RING_R}
        fill="none"
        strokeWidth="4"
        strokeLinecap="round"
        stroke={color}
        strokeDasharray={RING_C}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1, ease: 'easeOut' }}
      />
    </svg>
  );
}

// ─── Habit Card ────────────────────────────────────────────────────────────────

export function HabitCard({ habit }: { habit: HabitWithStats }) {
  const [expanded, setExpanded] = useState(false);
  const [isBursting, setIsBursting] = useState(false);
  const { mutate: checkIn, isPending: isCheckingIn } = useCheckIn();
  const { mutate: undoCheckIn, isPending: isUndoing } = useUndoCheckIn();
  const { mutate: deleteHabit, isPending: isDeleting } = useDeleteHabit();
  const { data: logsData = [] } = useHabitLogs(habit.id, expanded);

  function handleCheckIn() {
    if (habit.completedToday) {
      undoCheckIn(habit.id, {
        onError: () => toast.error('Failed to undo check-in'),
      });
    } else {
      checkIn({ habitId: habit.id }, {
        onSuccess: () => {
          setIsBursting(true);
          window.setTimeout(() => setIsBursting(false), 520);
        },
        onError: () => toast.error('Failed to check in'),
      });
    }
  }

  function handleDelete() {
    if (!confirm(`Delete "${habit.name}"? This cannot be undone.`)) return;
    deleteHabit(habit.id, {
      onSuccess: () => toast.success('Habit deleted'),
      onError: () => toast.error('Failed to delete habit'),
    });
  }

  const isActive = isCheckingIn || isUndoing;

  return (
    <motion.div
      layout
      className="relative overflow-hidden rounded-2xl border border-white/8 bg-white/[0.04] backdrop-blur-sm"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35 }}
    >
      {/* Subtle colour accent strip */}
      <div
        className="absolute left-0 top-0 h-full w-1 rounded-l-2xl"
        style={{ backgroundColor: habit.color }}
      />

      <div className="pl-3">
        {/* Main row */}
        <div className="flex items-center gap-3 p-3">
          {/* Progress ring + icon */}
          <div className="relative shrink-0">
            <ProgressRing progress={habit.completionRate} color={habit.color} />
            <div className="absolute inset-0 flex items-center justify-center text-xl">
              {habit.icon}
            </div>
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate font-semibold text-white">{habit.name}</p>
              {habit.currentStreak >= 3 && (
                <motion.span
                  className="flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-bold"
                  style={{
                    backgroundColor: `${habit.color}22`,
                    color: habit.color,
                    border: `1px solid ${habit.color}44`,
                  }}
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                >
                  <Flame className="h-3 w-3" />
                  {habit.currentStreak}
                </motion.span>
              )}
            </div>
            <div className="flex items-center gap-3 text-[11px] text-white/40">
              <span>{habit.totalCompletions} total</span>
              <span>Best: {habit.longestStreak} days</span>
              <span>{habit.completionRate}% rate</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-1.5">
            {/* Check-in button */}
            <motion.button
              type="button"
              onClick={handleCheckIn}
              disabled={isActive}
              className={cn(
                'relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300',
                habit.completedToday
                  ? 'text-white shadow-lg'
                  : 'border border-white/10 bg-white/5 text-white/40 hover:border-white/20 hover:text-white',
              )}
              style={habit.completedToday ? { backgroundColor: habit.color } : {}}
              whileHover={{ scale: 1.07 }}
              whileTap={{ scale: 0.9 }}
            >
              <AnimatePresence>
                {isBursting ? (
                  <>
                    {[...Array(8)].map((_, i) => {
                      const angle = (i / 8) * Math.PI * 2;
                      const x = Math.cos(angle) * 18;
                      const y = Math.sin(angle) * 18;

                      return (
                        <motion.span
                          key={i}
                          className="pointer-events-none absolute h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: habit.color }}
                          initial={{ opacity: 0.9, scale: 1, x: 0, y: 0 }}
                          animate={{ opacity: 0, scale: 0.3, x, y }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.45, ease: 'easeOut' }}
                        />
                      );
                    })}
                  </>
                ) : null}
              </AnimatePresence>

              <AnimatePresence mode="wait">
                {habit.completedToday ? (
                  <motion.div
                    key="check"
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  >
                    <Check className="h-5 w-5 stroke-[3]" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  >
                    <Check className="h-4 w-4" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Expand toggle */}
            <button
              type="button"
              onClick={() => setExpanded((s) => !s)}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-white/30 transition hover:bg-white/8 hover:text-white/60"
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            {/* Delete */}
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-white/20 transition hover:bg-red-500/10 hover:text-red-400"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Expanded heatmap */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden border-t border-white/6 px-3 pb-4 pt-3"
            >
              {habit.description && (
                <p className="mb-3 text-xs text-white/40">{habit.description}</p>
              )}
              <HabitHeatmap logs={logsData} color={habit.color} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
