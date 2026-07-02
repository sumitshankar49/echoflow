'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronDown,
  ChevronUp,
  Coffee,
  Expand,
  Maximize2,
  Minimize2,
  Music2,
  Pause,
  Play,
  RefreshCw,
  Settings2,
  SkipForward,
  Volume2,
  VolumeX,
  Wind,
  Waves,
  TreePine,
  Flame,
  CloudRain,
  Radio,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useMusicPlayerStore } from '@/shared/store/music-player.store';
import { Button } from '@/components/ui/button';
import { useFocusSettings } from './use-focus-settings';
import { useUpdateFocusSettings } from './use-update-focus-settings';
import { useRecordFocusSession } from './use-record-focus-session';
import { useFocusTimer, type TimerPhase } from './use-focus-timer';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AmbientSound {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  url: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const AMBIENT_SOUNDS: AmbientSound[] = [
  {
    id: 'rain',
    label: 'Rain',
    icon: CloudRain,
    color: 'from-sky-500/80 to-blue-600/80',
    url: 'https://assets.mixkit.co/sfx/download/mixkit-rain-and-thunder-storm-2390.wav',
  },
  {
    id: 'forest',
    label: 'Forest',
    icon: TreePine,
    color: 'from-emerald-500/80 to-green-600/80',
    url: 'https://assets.mixkit.co/sfx/download/mixkit-forest-ambience-at-night-1242.wav',
  },
  {
    id: 'waves',
    label: 'Ocean',
    icon: Waves,
    color: 'from-cyan-500/80 to-teal-600/80',
    url: 'https://assets.mixkit.co/sfx/download/mixkit-ocean-wave-rushing-over-rocks-2182.wav',
  },
  {
    id: 'wind',
    label: 'Wind',
    icon: Wind,
    color: 'from-slate-400/80 to-zinc-500/80',
    url: 'https://assets.mixkit.co/sfx/download/mixkit-howling-wind-2460.wav',
  },
  {
    id: 'fire',
    label: 'Fireplace',
    icon: Flame,
    color: 'from-orange-500/80 to-red-600/80',
    url: 'https://assets.mixkit.co/sfx/download/mixkit-campfire-crackles-1326.wav',
  },
  {
    id: 'cafe',
    label: 'Café',
    icon: Coffee,
    color: 'from-amber-500/80 to-yellow-600/80',
    url: 'https://assets.mixkit.co/sfx/download/mixkit-restaurant-crowd-talking-ambience-444.wav',
  },
];

const PHASE_LABELS: Record<TimerPhase, string> = {
  focus: 'Focus',
  shortBreak: 'Short Break',
  longBreak: 'Long Break',
};

const PHASE_COLORS: Record<TimerPhase, { ring: string; glow: string; badge: string }> = {
  focus: {
    ring: 'stroke-violet-400',
    glow: 'shadow-violet-500/40',
    badge: 'bg-violet-500/20 text-violet-300 border-violet-400/30',
  },
  shortBreak: {
    ring: 'stroke-emerald-400',
    glow: 'shadow-emerald-500/40',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
  },
  longBreak: {
    ring: 'stroke-sky-400',
    glow: 'shadow-sky-500/40',
    badge: 'bg-sky-500/20 text-sky-300 border-sky-400/30',
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTimerDisplay(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function formatDurationLabel(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

// ─── SVG Ring Timer ────────────────────────────────────────────────────────────

const RING_R = 130;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_R;

function TimerRing({
  progress,
  phase,
  isRunning,
}: {
  progress: number;
  phase: TimerPhase;
  isRunning: boolean;
}) {
  const colors = PHASE_COLORS[phase];
  const offset = RING_CIRCUMFERENCE * (1 - progress);

  return (
    <svg
      className="absolute inset-0"
      width="100%"
      height="100%"
      viewBox="0 0 300 300"
      style={{ transform: 'rotate(-90deg)' }}
    >
      {/* Track */}
      <circle
        cx="150"
        cy="150"
        r={RING_R}
        fill="none"
        stroke="rgba(255,255,255,0.07)"
        strokeWidth="6"
      />
      {/* Progress arc */}
      <motion.circle
        cx="150"
        cy="150"
        r={RING_R}
        fill="none"
        strokeWidth="6"
        strokeLinecap="round"
        className={colors.ring}
        strokeDasharray={RING_CIRCUMFERENCE}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
      />
      {/* Pulse dot at tip */}
      {isRunning && (
        <motion.circle
          cx={150 + RING_R * Math.sin(progress * 2 * Math.PI)}
          cy={150 - RING_R * Math.cos(progress * 2 * Math.PI)}
          r="5"
          className={colors.ring}
          fill="currentColor"
          animate={{ scale: [1, 1.5, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 1.4, repeat: Infinity }}
        />
      )}
    </svg>
  );
}

// ─── Ambient Sound Button ─────────────────────────────────────────────────────

function AmbientButton({
  sound,
  isActive,
  volume,
  onToggle,
}: {
  sound: AmbientSound;
  isActive: boolean;
  volume: number;
  onToggle: () => void;
}) {
  const Icon = sound.icon;

  return (
    <motion.button
      type="button"
      onClick={onToggle}
      className={cn(
        'relative flex flex-col items-center gap-1.5 rounded-2xl border px-3 py-3 text-xs font-medium transition-all duration-300 sm:px-4',
        isActive
          ? 'border-white/20 bg-white/15 text-white shadow-lg shadow-black/20'
          : 'border-white/8 bg-white/5 text-white/50 hover:border-white/15 hover:bg-white/10 hover:text-white/80',
      )}
      whileHover={{ scale: 1.04, y: -1 }}
      whileTap={{ scale: 0.96 }}
    >
      {isActive && (
        <motion.div
          className={cn('absolute inset-0 rounded-2xl bg-gradient-to-br opacity-25', sound.color)}
          layoutId={`ambient-glow-${sound.id}`}
          transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
        />
      )}
      <Icon className="relative z-10 h-4 w-4 sm:h-5 sm:w-5" />
      <span className="relative z-10 leading-none">{sound.label}</span>
      {isActive && (
        <motion.span
          className="relative z-10 flex gap-0.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="h-2 w-0.5 rounded-full bg-white/70"
              animate={{ scaleY: [0.4, 1, 0.4] }}
              transition={{
                duration: 0.7,
                repeat: Infinity,
                delay: i * 0.15,
                ease: 'easeInOut',
              }}
            />
          ))}
        </motion.span>
      )}
    </motion.button>
  );
}

// ─── Session dot indicator ────────────────────────────────────────────────────

function SessionDots({
  completed,
  total,
}: {
  completed: number;
  total: number;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          className={cn(
            'h-2 w-2 rounded-full',
            i < completed % total
              ? 'bg-violet-400'
              : i < completed % total || (completed > 0 && completed % total === 0 && i === total - 1)
                ? 'bg-violet-400'
                : 'bg-white/15',
          )}
          animate={
            i === completed % total && completed > 0
              ? { scale: [1, 1.3, 1] }
              : {}
          }
          transition={{ duration: 0.4 }}
        />
      ))}
    </div>
  );
}

// ─── Settings Panel ────────────────────────────────────────────────────────────

function SettingsPanel({
  focusDuration,
  shortBreakDuration,
  longBreakDuration,
  sessionsUntilLongBreak,
  autoStartBreaks,
  autoStartSessions,
  soundEnabled,
  isSaving,
  onSave,
  onClose,
}: {
  focusDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsUntilLongBreak: number;
  autoStartBreaks: boolean;
  autoStartSessions: boolean;
  soundEnabled: boolean;
  isSaving: boolean;
  onSave: (values: {
    focusDuration: number;
    shortBreakDuration: number;
    longBreakDuration: number;
    sessionsUntilLongBreak: number;
    autoStartBreaks: boolean;
    autoStartSessions: boolean;
    soundEnabled: boolean;
  }) => void;
  onClose: () => void;
}) {
  const [localFocus, setLocalFocus] = useState(focusDuration);
  const [localShort, setLocalShort] = useState(shortBreakDuration);
  const [localLong, setLocalLong] = useState(longBreakDuration);
  const [localSessions, setLocalSessions] = useState(sessionsUntilLongBreak);
  const [localAutoBreaks, setLocalAutoBreaks] = useState(autoStartBreaks);
  const [localAutoSessions, setLocalAutoSessions] = useState(autoStartSessions);
  const [localSound, setLocalSound] = useState(soundEnabled);

  function NumberInput({
    label,
    value,
    min,
    max,
    onChange,
  }: {
    label: string;
    value: number;
    min: number;
    max: number;
    onChange: (v: number) => void;
  }) {
    return (
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-white/60">{label}</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onChange(Math.max(min, value - 1))}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/8 text-white/60 transition hover:bg-white/15 hover:text-white"
          >
            −
          </button>
          <span className="w-8 text-center text-sm font-semibold text-white">{value}</span>
          <button
            type="button"
            onClick={() => onChange(Math.min(max, value + 1))}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/8 text-white/60 transition hover:bg-white/15 hover:text-white"
          >
            +
          </button>
        </div>
      </div>
    );
  }

  function Toggle({
    label,
    checked,
    onChange,
  }: {
    label: string;
    checked: boolean;
    onChange: (v: boolean) => void;
  }) {
    return (
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-white/60">{label}</span>
        <button
          type="button"
          onClick={() => onChange(!checked)}
          className={cn(
            'relative h-6 w-11 rounded-full transition-colors duration-200',
            checked ? 'bg-violet-500' : 'bg-white/15',
          )}
        >
          <motion.span
            className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm"
            animate={{ left: checked ? '1.375rem' : '0.125rem' }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </button>
      </div>
    );
  }

  return (
    <motion.div
      className="absolute inset-0 z-20 flex flex-col rounded-3xl bg-slate-950/95 backdrop-blur-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.25 }}
    >
      <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
        <h3 className="font-semibold text-white">Timer Settings</h3>
        <button
          type="button"
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-white/40 transition hover:bg-white/10 hover:text-white"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-white/30">Durations (min)</p>
        <div className="mb-5 space-y-3 rounded-2xl bg-white/5 p-4">
          <NumberInput label="Focus" value={localFocus} min={1} max={120} onChange={setLocalFocus} />
          <NumberInput label="Short Break" value={localShort} min={1} max={60} onChange={setLocalShort} />
          <NumberInput label="Long Break" value={localLong} min={1} max={120} onChange={setLocalLong} />
          <NumberInput
            label="Sessions until long break"
            value={localSessions}
            min={1}
            max={10}
            onChange={setLocalSessions}
          />
        </div>

        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-white/30">Behaviour</p>
        <div className="mb-5 space-y-4 rounded-2xl bg-white/5 p-4">
          <Toggle label="Auto-start breaks" checked={localAutoBreaks} onChange={setLocalAutoBreaks} />
          <Toggle label="Auto-start sessions" checked={localAutoSessions} onChange={setLocalAutoSessions} />
          <Toggle label="Notification sound" checked={localSound} onChange={setLocalSound} />
        </div>
      </div>

      <div className="border-t border-white/8 p-5">
        <Button
          className="w-full bg-violet-600 text-white hover:bg-violet-500"
          disabled={isSaving}
          onClick={() =>
            onSave({
              focusDuration: localFocus,
              shortBreakDuration: localShort,
              longBreakDuration: localLong,
              sessionsUntilLongBreak: localSessions,
              autoStartBreaks: localAutoBreaks,
              autoStartSessions: localAutoSessions,
              soundEnabled: localSound,
            })
          }
        >
          {isSaving ? 'Saving…' : 'Save Settings'}
        </Button>
      </div>
    </motion.div>
  );
}

// ─── Main View ─────────────────────────────────────────────────────────────────

export function FocusModeView() {
  const { data: settings, isPending, isError } = useFocusSettings();
  const { mutate: updateSettings, isPending: isSaving } = useUpdateFocusSettings();
  const { mutate: recordSession } = useRecordFocusSession();

  // Music store
  const musicIsPlaying = useMusicPlayerStore((s) => s.isPlaying);
  const musicTrack = useMusicPlayerStore((s) => s.tracks[s.activeIndex] ?? null);
  const musicPlaylistName = useMusicPlayerStore((s) => s.playlistName);
  const toggleMusicPlayback = useMusicPlayerStore((s) => s.togglePlayback);

  // Ambient sounds state
  const [activeAmbient, setActiveAmbient] = useState<string | null>(null);
  const [ambientVolume] = useState(0.4);
  const ambientAudioRef = useRef<HTMLAudioElement | null>(null);

  // UI state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showMusicPanel, setShowMusicPanel] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Timer
  const timerOptions = {
    focusDuration: settings?.focusDuration ?? 25,
    shortBreakDuration: settings?.shortBreakDuration ?? 5,
    longBreakDuration: settings?.longBreakDuration ?? 15,
    sessionsUntilLongBreak: settings?.sessionsUntilLongBreak ?? 4,
    autoStartBreaks: settings?.autoStartBreaks ?? false,
    autoStartSessions: settings?.autoStartSessions ?? false,
    onSessionComplete: useCallback(
      (durationMinutes: number, wasCompleted: boolean) => {
        recordSession({ durationMinutes, wasCompleted });
      },
      [recordSession],
    ),
  };

  const timer = useFocusTimer(timerOptions);
  const colors = PHASE_COLORS[timer.phase];

  // Ambient sound management
  const toggleAmbient = useCallback(
    (sound: AmbientSound) => {
      if (activeAmbient === sound.id) {
        ambientAudioRef.current?.pause();
        ambientAudioRef.current = null;
        setActiveAmbient(null);
        return;
      }

      ambientAudioRef.current?.pause();
      const audio = new Audio(sound.url);
      audio.loop = true;
      audio.volume = ambientVolume;
      void audio.play().catch(() => {
        toast.error('Could not play ambient sound — browser blocked autoplay.');
      });
      ambientAudioRef.current = audio;
      setActiveAmbient(sound.id);
    },
    [activeAmbient, ambientVolume],
  );

  // Cleanup ambient on unmount
  useEffect(() => {
    return () => {
      ambientAudioRef.current?.pause();
    };
  }, []);

  // Fullscreen API
  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      await containerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  useEffect(() => {
    if (isError) {
      toast.error("Couldn't load your focus settings — using defaults for now.");
    }
  }, [isError]);

  if (isPending) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <motion.div
          className="h-10 w-10 rounded-full border-2 border-violet-400/30 border-t-violet-400"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    );
  }

  const phaseColors = PHASE_COLORS[timer.phase];

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative flex min-h-screen flex-col overflow-hidden',
        isFullscreen ? 'fixed inset-0 z-[100]' : 'min-h-[calc(100vh-4rem)]',
      )}
      style={{
        background:
          'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(124,58,237,0.18) 0%, transparent 60%), radial-gradient(ellipse 70% 50% at 80% 80%, rgba(16,185,129,0.10) 0%, transparent 55%), radial-gradient(ellipse 60% 55% at 10% 70%, rgba(56,189,248,0.10) 0%, transparent 55%), linear-gradient(160deg, #0a0514 0%, #0d0d1f 40%, #060f1a 100%)',
      }}
    >
      {/* Animated background orbs */}
      <motion.div
        className="pointer-events-none absolute left-[-15%] top-[-10%] h-[500px] w-[500px] rounded-full bg-violet-600/8 blur-[100px]"
        animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="pointer-events-none absolute bottom-[-10%] right-[-10%] h-[450px] w-[450px] rounded-full bg-cyan-500/7 blur-[100px]"
        animate={{ x: [0, -25, 0], y: [0, -15, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="pointer-events-none absolute bottom-[20%] left-[20%] h-[350px] w-[350px] rounded-full bg-emerald-500/5 blur-[80px]"
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Floating particles */}
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          className="pointer-events-none absolute rounded-full bg-white/10"
          style={{
            width: 2 + (i % 3),
            height: 2 + (i % 3),
            left: `${6 + i * 7.5}%`,
            top: `${10 + (i * 13) % 80}%`,
          }}
          animate={{ y: [0, -20, 0], opacity: [0.05, 0.35, 0.05] }}
          transition={{ duration: 4 + i * 0.6, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
        />
      ))}

      {/* Header toolbar */}
      <motion.div
        className="relative z-10 flex items-center justify-between px-4 py-4 sm:px-6"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-500/20 ring-1 ring-violet-400/30">
            <span className="text-sm">🎯</span>
          </div>
          <span className="text-sm font-semibold text-white/70 sm:text-base">Focus Mode</span>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            type="button"
            onClick={() => setShowSettings((s) => !s)}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-xl border transition-all',
              showSettings
                ? 'border-violet-400/40 bg-violet-500/20 text-violet-300'
                : 'border-white/10 bg-white/5 text-white/40 hover:border-white/20 hover:bg-white/10 hover:text-white',
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Settings2 className="h-4 w-4" />
          </motion.button>

          <motion.button
            type="button"
            onClick={toggleFullscreen}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/40 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </motion.button>
        </div>
      </motion.div>

      {/* Main content */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 pb-6 sm:px-6">
        {/* Phase tabs */}
        <motion.div
          className="mb-8 flex items-center gap-1 rounded-2xl border border-white/8 bg-white/5 p-1 backdrop-blur-sm"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {(['focus', 'shortBreak', 'longBreak'] as TimerPhase[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => timer.switchPhase(p)}
              className={cn(
                'relative rounded-xl px-3 py-1.5 text-xs font-medium transition-all duration-300 sm:px-4 sm:text-sm',
                timer.phase === p ? 'text-white' : 'text-white/40 hover:text-white/70',
              )}
            >
              {timer.phase === p && (
                <motion.div
                  className={cn(
                    'absolute inset-0 rounded-xl',
                    p === 'focus'
                      ? 'bg-violet-500/30'
                      : p === 'shortBreak'
                        ? 'bg-emerald-500/30'
                        : 'bg-sky-500/30',
                  )}
                  layoutId="phase-pill"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                />
              )}
              <span className="relative">{PHASE_LABELS[p]}</span>
            </button>
          ))}
        </motion.div>

        {/* Timer circle */}
        <motion.div
          className="relative mb-8"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15, type: 'spring', stiffness: 100 }}
        >
          {/* Glow behind ring */}
          <AnimatePresence mode="wait">
            <motion.div
              key={timer.phase}
              className={cn(
                'absolute inset-[-20px] rounded-full blur-2xl',
                timer.phase === 'focus'
                  ? 'bg-violet-500/15'
                  : timer.phase === 'shortBreak'
                    ? 'bg-emerald-500/15'
                    : 'bg-sky-500/15',
              )}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            />
          </AnimatePresence>

          {/* Pulsing ring when running */}
          {timer.isRunning && (
            <motion.div
              className={cn(
                'absolute inset-[-4px] rounded-full border',
                timer.phase === 'focus'
                  ? 'border-violet-400/25'
                  : timer.phase === 'shortBreak'
                    ? 'border-emerald-400/25'
                    : 'border-sky-400/25',
              )}
              animate={{ scale: [1, 1.04, 1], opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}

          <div className="relative h-[300px] w-[300px] sm:h-[340px] sm:w-[340px]">
            <TimerRing progress={timer.progress} phase={timer.phase} isRunning={timer.isRunning} />

            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <AnimatePresence mode="wait">
                <motion.span
                  key={`${timer.phase}-label`}
                  className={cn(
                    'rounded-full border px-3 py-0.5 text-xs font-semibold uppercase tracking-widest',
                    phaseColors.badge,
                  )}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.3 }}
                >
                  {PHASE_LABELS[timer.phase]}
                </motion.span>
              </AnimatePresence>

              <motion.div
                className="font-mono text-6xl font-bold tracking-tight text-white sm:text-7xl"
                key={`${timer.phase}-timer`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                style={{ textShadow: '0 0 40px rgba(255,255,255,0.12)' }}
              >
                {formatTimerDisplay(timer.secondsLeft)}
              </motion.div>

              {/* Session dots */}
              <SessionDots
                completed={timer.completedSessions}
                total={timerOptions.sessionsUntilLongBreak}
              />
            </div>
          </div>
        </motion.div>

        {/* Controls */}
        <motion.div
          className="mb-8 flex items-center gap-3"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          <motion.button
            type="button"
            onClick={timer.reset}
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/40 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.93 }}
          >
            <RefreshCw className="h-4 w-4" />
          </motion.button>

          <motion.button
            type="button"
            onClick={timer.isRunning ? timer.pause : timer.start}
            className={cn(
              'flex h-16 w-16 items-center justify-center rounded-full text-white shadow-xl transition-all duration-300 sm:h-18 sm:w-18',
              timer.phase === 'focus'
                ? 'bg-violet-600 shadow-violet-500/40 hover:bg-violet-500'
                : timer.phase === 'shortBreak'
                  ? 'bg-emerald-600 shadow-emerald-500/40 hover:bg-emerald-500'
                  : 'bg-sky-600 shadow-sky-500/40 hover:bg-sky-500',
            )}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.93 }}
          >
            <AnimatePresence mode="wait">
              {timer.isRunning ? (
                <motion.div
                  key="pause"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Pause className="h-6 w-6 fill-white" />
                </motion.div>
              ) : (
                <motion.div
                  key="play"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Play className="h-6 w-6 translate-x-0.5 fill-white" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          <motion.button
            type="button"
            onClick={timer.skipPhase}
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/40 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.93 }}
          >
            <SkipForward className="h-4 w-4" />
          </motion.button>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          className="mb-8 flex items-center gap-4 rounded-2xl border border-white/8 bg-white/5 px-5 py-3 backdrop-blur-sm sm:gap-6"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-xl font-bold text-white">{timer.completedSessions}</span>
            <span className="text-[11px] text-white/40">Sessions</span>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-xl font-bold text-white">
              {formatDurationLabel(timer.totalFocusSeconds)}
            </span>
            <span className="text-[11px] text-white/40">Focus time</span>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-xl font-bold text-white">
              {timerOptions.sessionsUntilLongBreak - (timer.completedSessions % timerOptions.sessionsUntilLongBreak)}
            </span>
            <span className="text-[11px] text-white/40">Until long break</span>
          </div>
        </motion.div>

        {/* Ambient sounds */}
        <motion.div
          className="mb-6 w-full max-w-md"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
        >
          <p className="mb-3 text-center text-xs font-medium uppercase tracking-wider text-white/30">
            Ambient Sounds
          </p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {AMBIENT_SOUNDS.map((sound) => (
              <AmbientButton
                key={sound.id}
                sound={sound}
                isActive={activeAmbient === sound.id}
                volume={ambientVolume}
                onToggle={() => toggleAmbient(sound)}
              />
            ))}
          </div>
        </motion.div>

        {/* Music integration */}
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <button
            type="button"
            onClick={() => setShowMusicPanel((s) => !s)}
            className="mb-3 flex w-full items-center justify-between rounded-2xl border border-white/8 bg-white/5 px-4 py-3 text-left transition hover:border-white/12 hover:bg-white/8"
          >
            <div className="flex items-center gap-2.5">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-xl',
                  musicIsPlaying
                    ? 'bg-cyan-500/20 text-cyan-300'
                    : 'bg-white/8 text-white/40',
                )}
              >
                <Music2 className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-white/80">
                  {musicTrack ? musicTrack.title : 'FocusFlow Music'}
                </p>
                <p className="truncate text-[11px] text-white/35">
                  {musicIsPlaying
                    ? `Playing · ${musicPlaylistName}`
                    : musicTrack
                      ? 'Paused'
                      : 'No track loaded · go to Music to set a playlist'}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {musicTrack && (
                <motion.button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMusicPlayback();
                  }}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.93 }}
                >
                  {musicIsPlaying ? <Pause className="h-3 w-3 fill-white" /> : <Play className="h-3 w-3 fill-white translate-x-px" />}
                </motion.button>
              )}
              {showMusicPanel ? (
                <ChevronUp className="h-3.5 w-3.5 text-white/30" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5 text-white/30" />
              )}
            </div>
          </button>

          <AnimatePresence>
            {showMusicPanel && (
              <motion.div
                className="overflow-hidden rounded-2xl border border-white/8 bg-white/5 backdrop-blur-sm"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              >
                <div className="p-4">
                  {musicTrack ? (
                    <div className="flex items-start gap-3">
                      {musicTrack.coverImage && (
                        <img
                          src={musicTrack.coverImage}
                          alt={musicTrack.title}
                          className="h-12 w-12 shrink-0 rounded-xl object-cover"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-white">{musicTrack.title}</p>
                        <p className="truncate text-xs text-white/45">{musicTrack.subtitle}</p>
                        <p className="mt-0.5 text-[11px] text-white/30">{musicPlaylistName}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 py-2 text-center">
                      <Radio className="h-8 w-8 text-white/20" />
                      <p className="text-sm text-white/45">
                        No music loaded. Visit the{' '}
                        <a href="/music" className="text-cyan-400 underline-offset-2 hover:underline">
                          Music page
                        </a>{' '}
                        to start a playlist.
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Settings overlay */}
      <AnimatePresence>
        {showSettings && (
          <SettingsPanel
            focusDuration={settings?.focusDuration ?? 25}
            shortBreakDuration={settings?.shortBreakDuration ?? 5}
            longBreakDuration={settings?.longBreakDuration ?? 15}
            sessionsUntilLongBreak={settings?.sessionsUntilLongBreak ?? 4}
            autoStartBreaks={settings?.autoStartBreaks ?? false}
            autoStartSessions={settings?.autoStartSessions ?? false}
            soundEnabled={settings?.soundEnabled ?? true}
            isSaving={isSaving}
            onSave={(values) => {
              updateSettings(values, {
                onSuccess: () => {
                  toast.success('Settings saved');
                  setShowSettings(false);
                },
                onError: () => toast.error('Failed to save settings'),
              });
            }}
            onClose={() => setShowSettings(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
