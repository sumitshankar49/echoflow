'use client';

import { ExternalLink, Pause, Play, SkipBack, SkipForward, Waves } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatTime, type PlaylistTrack } from '../domain/music.utils';

interface FocusFlowMiniPlayerProps {
  playlistName: string;
  track: PlaylistTrack | null;
  isPlaying: boolean;
  progress: number;
  elapsedSeconds: number;
  onTogglePlayback: () => void;
  onPreviousTrack: () => void;
  onNextTrack: () => void;
}

export function FocusFlowMiniPlayer({
  playlistName,
  track,
  isPlaying,
  progress,
  elapsedSeconds,
  onTogglePlayback,
  onPreviousTrack,
  onNextTrack,
}: FocusFlowMiniPlayerProps) {
  if (!track) {
    return null;
  }

  return (
    <div className="sticky bottom-4 z-30 mt-10 pb-2">
      <div className="overflow-hidden rounded-[2rem] border border-white/15 bg-slate-950/90 shadow-[0_22px_60px_-25px_rgba(15,23,42,0.85)] backdrop-blur-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.24),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(52,211,153,0.18),transparent_30%)]" />
        <div className="relative grid gap-4 px-4 py-4 text-white md:grid-cols-[minmax(0,1.2fr)_minmax(320px,1fr)] md:px-6">
          <div className="flex min-w-0 items-center gap-4">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[1.35rem] border border-white/10 bg-slate-900">
              <div className={cn('absolute inset-0 bg-gradient-to-br', track.gradientClassName)} />
              {track.coverImage ? (
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-90"
                  style={{ backgroundImage: `url(${track.coverImage})` }}
                />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-black/45" />
              <div
                className={cn(
                  'absolute inset-[18%] rounded-full border border-white/30 bg-black/20 backdrop-blur-sm transition-transform duration-700',
                  isPlaying ? 'animate-[spin_12s_linear_infinite]' : '',
                )}
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/70">Now drifting</p>
              <div className="mt-1 flex items-center gap-2">
                <h3 className="truncate text-base font-semibold md:text-lg">{track.title}</h3>
                <span className="rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-white/65">
                  {track.sourceLabel}
                </span>
              </div>
              <p className="truncate text-sm text-white/60">{playlistName} • {track.subtitle}</p>
            </div>
          </div>

          <div className="grid gap-3 md:justify-items-end">
            <div className="flex items-center gap-2 md:gap-3">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="rounded-full border border-white/10 bg-white/5 text-white hover:bg-white/10"
                onClick={onPreviousTrack}
              >
                <SkipBack className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="icon-lg"
                className="rounded-full bg-white text-slate-950 shadow-[0_10px_30px_-15px_rgba(255,255,255,0.8)] hover:bg-cyan-50"
                onClick={onTogglePlayback}
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 fill-current" />}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="rounded-full border border-white/10 bg-white/5 text-white hover:bg-white/10"
                onClick={onNextTrack}
              >
                <SkipForward className="h-4 w-4" />
              </Button>
              <a
                href={track.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-8 items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 text-xs text-white/75 transition hover:bg-white/10 hover:text-white"
              >
                Open source
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>

            <div className="w-full max-w-xl space-y-2">
              <Progress value={progress} className="gap-0">
                <div className="flex items-center justify-between text-xs text-white/55">
                  <div className="inline-flex items-center gap-1.5">
                    <Waves className="h-3.5 w-3.5 text-cyan-200/75" />
                    Smooth focus playback
                  </div>
                  <span>{formatTime(elapsedSeconds)} / {formatTime(track.durationSeconds)}</span>
                </div>
              </Progress>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}