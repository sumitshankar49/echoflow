'use client';

import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { ExternalLink, Pause, Play, SkipBack, SkipForward, Waves } from 'lucide-react';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatTime, type PlaylistTrack } from '../domain/music.utils';
import { useTrackMetadata } from './use-track-metadata';

const ReactPlayer = dynamic(() => import('react-player'), { ssr: false });

interface FocusFlowMiniPlayerProps {
  playlistName: string;
  track: PlaylistTrack | null;
  isPlaying: boolean;
  progress: number;
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
  progress,
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

  if (!track) {
    return null;
  }

  const displayTitle = metadata?.title || track.title;
  const displayArtist = metadata?.artist || track.subtitle;
  const displayCoverImage = metadata?.thumbnailUrl || track.coverImage;
  const shouldMarquee = displayTitle.length > 34;
  const totalDuration = durationSeconds && durationSeconds > 0 ? durationSeconds : track.durationSeconds;

  return (
    <div className="sticky bottom-4 z-30 mt-10 pb-2">
      <div className="pointer-events-none fixed -left-[9999px] top-0 h-0 w-0 overflow-hidden opacity-0" aria-hidden>
        <ReactPlayer
          key={track.url}
          src={track.url}
          playing={isPlaying}
          controls={false}
          muted={false}
          volume={1}
          playsInline
          width="0"
          height="0"
          onPlay={() => onPlaybackStateChange?.(true)}
          onPause={() => onPlaybackStateChange?.(false)}
          onTimeUpdate={(event) => {
            const elapsed = event.currentTarget.currentTime;
            if (Number.isFinite(elapsed)) {
              onProgressChange?.(elapsed);
            }
          }}
          onDurationChange={(event) => {
            const duration = event.currentTarget.duration;
            if (Number.isFinite(duration) && duration > 0) {
              onDurationChange?.(duration);
            }
          }}
          onEnded={() => onTrackEnded?.()}
          onError={() => {
            onPlaybackError?.();
            toast.error('This source could not be played here. Try Open source.');
          }}
        />
      </div>
      <div className="overflow-hidden rounded-[2rem] border border-white/15 bg-slate-950/90 shadow-[0_22px_60px_-25px_rgba(15,23,42,0.85)] backdrop-blur-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.24),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(52,211,153,0.18),transparent_30%)]" />
        <motion.div
          key={track.gradientClassName}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className={cn('pointer-events-none absolute inset-0 bg-gradient-to-r opacity-35 blur-2xl', track.gradientClassName)}
        />
        <div className="relative grid gap-4 px-4 py-4 text-white md:grid-cols-[minmax(0,1.2fr)_minmax(320px,1fr)] md:px-6">
          <div className="flex min-w-0 items-center gap-4">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[1.35rem] border border-white/10 bg-slate-900">
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

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/70">Now drifting</p>
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
                      className="flex min-w-max items-center gap-8 text-base font-semibold md:text-lg"
                      animate={{ x: ['0%', '-45%'] }}
                      transition={{ duration: 8, ease: 'linear', repeat: Infinity }}
                    >
                      <span>{displayTitle}</span>
                      <span aria-hidden>{displayTitle}</span>
                    </motion.div>
                  ) : (
                    <h3 className="truncate text-base font-semibold md:text-lg">{displayTitle}</h3>
                  )}
                </div>
                <span className="rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-white/65">
                  {track.sourceLabel}
                </span>
              </div>
              <p className="truncate text-sm text-white/60">{playlistName} • {displayArtist}</p>
            </div>
          </div>

          <div className="grid gap-3 md:justify-items-end">
            <div className="flex items-center gap-2 md:gap-3">
              <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.95 }}>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="rounded-full border border-white/10 bg-white/5 text-white hover:bg-white/10"
                  onClick={onPreviousTrack}
                  title="Previous track"
                >
                  <SkipBack className="h-4 w-4" />
                </Button>
              </motion.div>

              <motion.div
                whileTap={{ scale: 0.92 }}
                animate={isPlaying ? { boxShadow: ['0 8px 24px -12px rgba(103,232,249,0.25)', '0 10px 30px -12px rgba(103,232,249,0.55)', '0 8px 24px -12px rgba(103,232,249,0.25)'] } : {}}
                transition={{ duration: 1.5, repeat: isPlaying ? Infinity : 0, ease: 'easeInOut' }}
              >
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
                  className="rounded-full border border-white/10 bg-white/5 text-white hover:bg-white/10"
                  onClick={onNextTrack}
                  title="Next track"
                >
                  <SkipForward className="h-4 w-4" />
                </Button>
              </motion.div>

              <div className="hidden items-end gap-1 sm:flex" aria-label="Playback activity">
                {[0, 1, 2, 3].map((bar) => (
                  <motion.span
                    key={bar}
                    className="w-1 rounded-full bg-cyan-200/80"
                    animate={
                      isPlaying
                        ? { height: [6, 13 + bar, 8, 11 + bar, 6] }
                        : { height: 4 }
                    }
                    transition={{
                      duration: 0.9 + bar * 0.12,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                ))}
              </div>

              <a
                href={track.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-8 items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 text-xs text-white/75 transition hover:bg-white/10 hover:text-white"
                title="Open original source"
              >
                Open source
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>

            <div className="w-full max-w-xl space-y-2">
              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-200 via-sky-300 to-emerald-200"
                  animate={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
                  transition={{ type: 'spring', stiffness: 110, damping: 22 }}
                />
              </div>
              <Progress value={progress} className="gap-0">
                <div className="flex items-center justify-between text-xs text-white/55">
                  <div className="inline-flex items-center gap-1.5">
                    <Waves className="h-3.5 w-3.5 text-cyan-200/75" />
                    {isPlaying ? 'Smooth focus playback' : 'Playback paused'}
                  </div>
                  <span>{formatTime(elapsedSeconds)} / {formatTime(totalDuration)}</span>
                </div>
              </Progress>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}