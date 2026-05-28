'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ExternalLink,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatTime, type PlaylistTrack } from '../domain/music.utils';
import { useTrackMetadata } from './use-track-metadata';

interface FocusFlowMiniPlayerProps {
  playlistName: string;
  track: PlaylistTrack | null;
  isPlaying: boolean;
  elapsedSeconds: number;
  durationSeconds?: number;
  onTogglePlayback: () => void;
  onPreviousTrack: () => void;
  onNextTrack: () => void;
  onPlaybackStateChange?: (isPlaying: boolean) => void;
  onProgressChange?: (elapsedSeconds: number) => void;
  onDurationChange?: (durationSeconds: number) => void;
  onTrackEnded?: () => void;
  onPlaybackError?: () => void;
}

export function FocusFlowMiniPlayer({
  playlistName,
  track,
  isPlaying,
  elapsedSeconds,
  durationSeconds,
  onTogglePlayback,
  onPreviousTrack,
  onNextTrack,
  onPlaybackStateChange,
  onProgressChange,
  onDurationChange,
  onTrackEnded,
  onPlaybackError,
}: FocusFlowMiniPlayerProps) {
  const metadata = useTrackMetadata(track?.url ?? null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [volume, setVolume] = useState(0.85);

  if (!track) {
    return null;
  }

  const displayTitle = metadata?.title || track.title;
  const displayArtist = metadata?.artist || track.subtitle;
  const displayCoverImage = metadata?.thumbnailUrl || track.coverImage;
  const shouldMarquee = displayTitle.length > 34;
  const totalDuration = durationSeconds && durationSeconds > 0 ? durationSeconds : track.durationSeconds;
  const safeElapsed = Math.max(0, elapsedSeconds);
  const safeTotal = Math.max(0, totalDuration);
  const progress = safeTotal > 0 ? Math.min(100, (safeElapsed / safeTotal) * 100) : 0;

  const handleSeek = (nextProgress: number) => {
    if (safeTotal <= 0) {
      return;
    }

    const clampedProgress = Math.max(0, Math.min(100, nextProgress));
    const seekSeconds = (clampedProgress / 100) * safeTotal;
    onProgressChange?.(seekSeconds);
  };

  const handleSeekInput = (nextValue: string) => {
    handleSeek(Number(nextValue));
  };

  return (
    <motion.div
      className="sticky bottom-3 z-30 mt-8 w-full pb-2 sm:bottom-4"
      initial={{ opacity: 0, y: 18, scale: 0.985 }}
      animate={{ opacity: 1, y: [0, -2, 0], scale: 1 }}
      transition={{ duration: 0.6, y: { duration: 5.8, repeat: Infinity, ease: 'easeInOut' } }}
    >
      <div
        className={cn(
          'mx-auto w-full overflow-hidden rounded-[2rem] border border-cyan-100/10 bg-slate-950/92 shadow-[0_24px_75px_-30px_rgba(15,23,42,0.9),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-2xl',
          isPlaying ? 'ring-1 ring-cyan-300/20' : '',
        )}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.22),transparent_36%),radial-gradient(circle_at_top_right,rgba(129,140,248,0.14),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(52,211,153,0.14),transparent_34%),linear-gradient(120deg,rgba(2,6,23,0.62),rgba(15,23,42,0.28))]" />
        <motion.div
          className="pointer-events-none absolute -left-14 -top-12 h-40 w-40 rounded-full bg-cyan-300/15 blur-3xl"
          animate={{ x: [0, 12, 0], y: [0, -8, 0] }}
          transition={{ duration: 7.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="pointer-events-none absolute right-[-24px] top-[-10px] h-36 w-36 rounded-full bg-indigo-400/15 blur-3xl"
          animate={{ x: [0, -10, 0], y: [0, 10, 0] }}
          transition={{ duration: 8.4, repeat: Infinity, ease: 'easeInOut' }}
        />
        {Array.from({ length: 10 }).map((_, index) => (
          <motion.span
            key={index}
            className="pointer-events-none absolute h-1 w-1 rounded-full bg-cyan-100/35"
            style={{ left: `${8 + index * 9}%`, top: `${18 + (index % 4) * 18}%` }}
            animate={{ opacity: [0.1, 0.75, 0.1], y: [0, -6, 0] }}
            transition={{ duration: 2.1 + index * 0.16, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
        <motion.div
          key={track.gradientClassName}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className={cn('pointer-events-none absolute inset-0 bg-gradient-to-r opacity-35 blur-2xl', track.gradientClassName)}
        />

        <div className="relative p-3 text-white sm:p-4 md:p-5">
          {isExpanded ? (
            <div className="space-y-3 rounded-2xl border border-white/12 bg-slate-900/55 p-3 backdrop-blur-md sm:p-4">
              <div className="grid gap-3 md:grid-cols-[92px_minmax(0,1fr)_auto] md:items-center">
                <div className="relative h-[84px] w-[84px] shrink-0 overflow-hidden rounded-[1.15rem] border border-white/10 bg-slate-900 sm:h-[92px] sm:w-[92px] sm:rounded-[1.35rem]">
                  <div className={cn('absolute inset-0 bg-gradient-to-br', track.gradientClassName)} />
                  {displayCoverImage ? (
                    <div
                      className={cn(
                        'absolute inset-0 bg-cover bg-center opacity-90 transition-transform duration-500',
                        isPlaying ? 'scale-105' : 'scale-100',
                      )}
                      style={{ backgroundImage: `url(${displayCoverImage})` }}
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-black/45" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] uppercase tracking-[0.28em] text-cyan-200/70 sm:text-xs sm:tracking-[0.35em]">Now drifting</p>
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.16em]',
                        isPlaying
                          ? 'bg-emerald-300/15 text-emerald-100 ring-1 ring-emerald-200/30'
                          : 'bg-white/10 text-white/70 ring-1 ring-white/15',
                      )}
                    >
                      {isPlaying ? 'Playing' : 'Paused'}
                    </span>
                    <motion.span
                      className="inline-flex h-2 w-2 rounded-full bg-emerald-300"
                      animate={isPlaying ? { scale: [0.95, 1.35, 0.95], opacity: [0.65, 1, 0.65] } : { scale: 1, opacity: 0.45 }}
                      transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  </div>

                  <div className="mt-1 flex items-center gap-2">
                    <div className="min-w-0 flex-1 overflow-hidden">
                      {shouldMarquee ? (
                        <motion.div
                          className="flex min-w-max items-center gap-8 text-sm font-semibold sm:text-base md:text-lg"
                          animate={{ x: ['0%', '-45%'] }}
                          transition={{ duration: 8, ease: 'linear', repeat: Infinity }}
                        >
                          <span>{displayTitle}</span>
                          <span aria-hidden>{displayTitle}</span>
                        </motion.div>
                      ) : (
                        <h3 className="truncate text-sm font-semibold sm:text-base md:text-lg">{displayTitle}</h3>
                      )}
                    </div>
                  </div>

                  <p className="truncate text-xs text-white/60 sm:text-sm">{displayArtist}</p>
                  <p className="mt-1 truncate text-[11px] text-white/50">{playlistName}</p>
                </div>

                <div className="flex flex-wrap items-center justify-start gap-2 md:justify-end">
                    <span className="rounded-full border border-white/20 bg-slate-800/55 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-white/80">
                    {track.sourceLabel}
                  </span>
                  <a
                    href={track.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-8 items-center gap-1 rounded-full border border-white/15 bg-slate-800/55 px-3 text-xs text-white/85 transition hover:bg-slate-700/60 hover:text-white"
                    title="Open original source"
                  >
                    Open source
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                  <button
                    type="button"
                    onClick={() => setIsExpanded(false)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-slate-800/55 text-white/85 transition hover:bg-slate-700/60 hover:text-white"
                    title="Collapse player"
                  >
                    <Minimize2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-white/12 bg-slate-900/70 px-3 py-3">
                  <div className="relative h-2 overflow-hidden rounded-full bg-white/20">
                    <motion.span
                      className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-transparent via-white/35 to-transparent"
                      animate={{ x: ['-100%', '500%'] }}
                      transition={{ duration: 2.3, repeat: Infinity, ease: 'linear' }}
                    />
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-200 via-sky-300 to-emerald-200"
                    animate={{ width: `${progress}%` }}
                    transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                  />
                    <motion.span
                      className="pointer-events-none absolute top-1/2 z-10 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-100/50 bg-cyan-200 shadow-[0_0_18px_rgba(125,211,252,0.75)]"
                      animate={{ left: `${progress}%` }}
                      transition={{ type: 'spring', stiffness: 130, damping: 20 }}
                    />
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={0.1}
                      value={progress}
                      onInput={(event) => handleSeekInput(event.currentTarget.value)}
                      onChange={(event) => handleSeekInput(event.currentTarget.value)}
                      className="absolute inset-0 z-20 h-full w-full cursor-pointer opacity-0"
                      aria-label="Seek playback"
                    />
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] text-white/65 sm:text-xs">
                  <span>{formatTime(safeElapsed)} / {formatTime(safeTotal)}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/12 bg-slate-900/70 px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                        className="rounded-full border border-white/15 bg-slate-800/60 text-white hover:bg-slate-700/60"
                      onClick={onPreviousTrack}
                      title="Previous track"
                    >
                      <SkipBack className="h-4 w-4" />
                    </Button>
                  </motion.div>

                  <motion.div
                    whileTap={{ scale: 0.92 }}
                    animate={
                      isPlaying
                        ? {
                            boxShadow: [
                              '0 8px 24px -12px rgba(103,232,249,0.25)',
                              '0 10px 30px -12px rgba(103,232,249,0.55)',
                              '0 8px 24px -12px rgba(103,232,249,0.25)',
                            ],
                          }
                        : {}
                    }
                    transition={{ duration: 1.5, repeat: isPlaying ? Infinity : 0, ease: 'easeInOut' }}
                    className="relative"
                  >
                    <motion.span
                      className="pointer-events-none absolute inset-0 rounded-full border border-cyan-200/45"
                      animate={isPlaying ? { scale: [1, 1.65], opacity: [0.45, 0] } : { scale: 1, opacity: 0 }}
                      transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
                    />
                    <motion.span
                      className="pointer-events-none absolute inset-0 rounded-full border border-sky-200/35"
                      animate={isPlaying ? { scale: [1, 1.95], opacity: [0.35, 0] } : { scale: 1, opacity: 0 }}
                      transition={{ duration: 1.7, repeat: Infinity, ease: 'easeOut', delay: 0.2 }}
                    />
                    <Button
                      type="button"
                      size="icon-lg"
                      className="rounded-full bg-white text-slate-950 shadow-[0_10px_30px_-15px_rgba(255,255,255,0.8)] hover:bg-cyan-50"
                      onClick={onTogglePlayback}
                      title={isPlaying ? 'Pause' : 'Play'}
                    >
                      {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 fill-current" />}
                    </Button>
                  </motion.div>

                  <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                        className="rounded-full border border-white/15 bg-slate-800/60 text-white hover:bg-slate-700/60"
                      onClick={onNextTrack}
                      title="Next track"
                    >
                      <SkipForward className="h-4 w-4" />
                    </Button>
                  </motion.div>

                  <div className="hidden items-end gap-1.5 sm:flex" aria-label="Playback waveform">
                    {[0, 1, 2, 3, 4, 5].map((bar) => (
                      <motion.span
                        key={bar}
                        className="w-1 rounded-full bg-cyan-200/85 shadow-[0_0_12px_rgba(125,211,252,0.55)]"
                        animate={isPlaying ? { height: [5, 10 + bar, 6, 12 + bar, 5] } : { height: 3 }}
                        transition={{ duration: 0.9 + bar * 0.08, repeat: Infinity, ease: 'easeInOut' }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-full border border-white/15 bg-slate-800/60 px-3 py-1.5">
                  <button
                    type="button"
                    onClick={() => setVolume((current) => (current > 0 ? 0 : 0.85))}
                    className="text-white/85 transition hover:text-white"
                    title={volume > 0 ? 'Mute' : 'Unmute'}
                  >
                    {volume > 0 ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={Math.round(volume * 100)}
                    onChange={(event) => setVolume(Math.max(0, Math.min(1, Number(event.target.value) / 100)))}
                    className="h-1.5 w-20 cursor-pointer accent-cyan-300 sm:w-28"
                    aria-label="Volume"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex w-full items-center justify-between gap-3 rounded-2xl border border-white/12 bg-slate-900/65 p-3 backdrop-blur-md sm:p-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{displayTitle}</p>
                <p className="truncate text-xs text-white/60">{displayArtist}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                    className="rounded-full border border-white/15 bg-slate-800/60 text-white hover:bg-slate-700/60"
                  onClick={onPreviousTrack}
                  title="Previous track"
                >
                  <SkipBack className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  size="icon-lg"
                  className="rounded-full bg-white text-slate-950 shadow-[0_10px_30px_-15px_rgba(255,255,255,0.8)] hover:bg-cyan-50"
                  onClick={onTogglePlayback}
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 fill-current" />}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                    className="rounded-full border border-white/15 bg-slate-800/60 text-white hover:bg-slate-700/60"
                  onClick={onNextTrack}
                  title="Next track"
                >
                  <SkipForward className="h-4 w-4" />
                </Button>
                <button
                  type="button"
                  onClick={() => setIsExpanded(true)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-slate-800/60 text-white/85 transition hover:bg-slate-700/60 hover:text-white"
                  title="Expand player"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
