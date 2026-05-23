'use client';

import { motion } from 'framer-motion';

const MOOD_STYLES = {
  calm: {
    emoji: '😌',
    orbGradient: 'from-cyan-300 via-sky-400 to-indigo-500',
    glow: 'rgba(56,189,248,0.55)',
    halo: 'rgba(125,211,252,0.42)',
  },
  focused: {
    emoji: '🧠',
    orbGradient: 'from-emerald-300 via-teal-400 to-cyan-500',
    glow: 'rgba(16,185,129,0.52)',
    halo: 'rgba(52,211,153,0.4)',
  },
  joyful: {
    emoji: '😊',
    orbGradient: 'from-amber-300 via-orange-400 to-rose-500',
    glow: 'rgba(251,146,60,0.55)',
    halo: 'rgba(253,186,116,0.4)',
  },
  reflective: {
    emoji: '🌙',
    orbGradient: 'from-indigo-300 via-violet-400 to-fuchsia-500',
    glow: 'rgba(129,140,248,0.5)',
    halo: 'rgba(196,181,253,0.36)',
  },
} as const;

export type MoodKind = keyof typeof MOOD_STYLES;

type DailyMoodOrbProps = {
  mood: MoodKind;
  onOpenJournal: () => void;
};

export function DailyMoodOrb({ mood, onOpenJournal }: DailyMoodOrbProps) {
  const style = MOOD_STYLES[mood] ?? MOOD_STYLES.calm;

  return (
    <motion.button
      type="button"
      onClick={onOpenJournal}
      whileTap={{ scale: 0.985 }}
      whileHover={{ scale: 1.01 }}
      className="group relative w-full overflow-hidden rounded-[1.9rem] border border-white/15 bg-[linear-gradient(145deg,rgba(8,47,73,0.35),rgba(15,23,42,0.92),rgba(30,58,138,0.42))] p-5 text-left shadow-[0_24px_70px_-42px_rgba(15,23,42,0.95)]"
    >
      <div className="pointer-events-none absolute -left-16 -top-16 h-52 w-52 rounded-full blur-3xl" style={{ backgroundColor: style.halo }} />
      <div className="pointer-events-none absolute -bottom-16 -right-12 h-48 w-48 rounded-full bg-white/10 blur-3xl" />

      <div className="relative flex items-center gap-5">
        <div className="relative flex h-44 w-44 shrink-0 items-center justify-center">
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ boxShadow: `0 0 52px ${style.glow}` }}
            animate={{ scale: [1, 1.07, 1], opacity: [0.34, 0.65, 0.34] }}
            transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
          />

          <motion.div
            className={`relative flex h-36 w-36 items-center justify-center rounded-full bg-gradient-to-br ${style.orbGradient} shadow-[inset_0_0_40px_rgba(255,255,255,0.24),0_22px_48px_-20px_rgba(15,23,42,0.75)]`}
            animate={{ scale: [1, 1.04, 1], y: [0, -3, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <motion.span
              className="text-6xl"
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
            >
              {style.emoji}
            </motion.span>
          </motion.div>

          <motion.div
            className="absolute inset-3 rounded-full border border-white/30"
            animate={{ opacity: [0.2, 0.55, 0.2], scale: [0.98, 1.08, 0.98] }}
            transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <div className="min-w-0 space-y-2">
          <p className="text-xs uppercase tracking-[0.24em] text-cyan-100/75">Mood ritual</p>
          <h3 className="text-2xl font-semibold tracking-tight text-white sm:text-[1.9rem]">How are you feeling today?</h3>
          <p className="max-w-sm text-sm leading-6 text-cyan-50/80">
            Tap the orb to open your mood journal and capture the tone of your day in one mindful moment.
          </p>
          <span className="inline-flex items-center rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.16em] text-cyan-50/90 transition-colors group-hover:bg-white/20">
            Open Mood Journal
          </span>
        </div>
      </div>
    </motion.button>
  );
}
