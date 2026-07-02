import { motion } from 'framer-motion';
import Link from 'next/link';
import { Pause, Play, SkipBack, SkipForward, Waves, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ShimmerCard } from '@/components/common/ShimmerCard';
import { formatTime } from '@/features/music/shared/domain/music.utils';

import { guessTrackName } from '../shared/dashboard-overview.utils';
import type { DashboardPlaylist } from '../types';

type MusicQuickPlayerCardProps = {
  isPending: boolean;
  quickPlayerPlaylist: DashboardPlaylist | undefined;
  playlistName: string;
  activeTrackUrl: string;
  activeTrackTitle: string;
  trackIndex: number;
  hasTracks: boolean;
  isPlaying: boolean;
  safeElapsed: number;
  safeDuration: number;
  remainingSeconds: number;
  musicProgress: number;
  togglePlayback: () => void;
  closePlayback: () => void;
  goToPreviousTrack: () => void;
  goToNextTrack: () => void;
};

export function MusicQuickPlayerCard({
  isPending,
  quickPlayerPlaylist,
  playlistName,
  activeTrackUrl,
  activeTrackTitle,
  trackIndex,
  hasTracks,
  isPlaying,
  safeElapsed,
  safeDuration,
  remainingSeconds,
  musicProgress,
  togglePlayback,
  closePlayback,
  goToPreviousTrack,
  goToNextTrack,
}: MusicQuickPlayerCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.17 }}
      className="h-full xl:col-span-4 rounded-2xl border border-border/70 bg-card/85 p-5 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.65)]"
    >
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Music quick player</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight">Flow soundtrack</h2>
        </div>
        <Waves className="h-5 w-5 text-cyan-500" />
      </div>

      {isPending ? (
        <ShimmerCard lineCount={4} className="mt-4 border-border/50 bg-background/55" />
      ) : quickPlayerPlaylist || hasTracks ? (
        <div className="mt-4 rounded-2xl border border-border/70 bg-background/70 p-4">
          <p className="font-medium">{hasTracks ? playlistName : quickPlayerPlaylist?.name}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {activeTrackTitle || (activeTrackUrl ? guessTrackName(activeTrackUrl, trackIndex) : 'No track playing')}
          </p>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="relative h-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-[width] duration-300 ease-out"
              style={{ width: `${musicProgress}%` }}
            >
              <div className="absolute inset-0 animate-pulse bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.35)_50%,transparent_100%)]" />
            </div>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-2 text-center sm:grid-cols-3">
            <div className="rounded-xl border border-border/70 bg-background/80 px-2 py-1.5">
              <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Elapsed</p>
              <p className="mt-0.5 text-xs font-semibold">{formatTime(safeElapsed)}</p>
            </div>
            <div className="rounded-xl border border-border/70 bg-background/80 px-2 py-1.5">
              <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Total</p>
              <p className="mt-0.5 text-xs font-semibold">{formatTime(safeDuration)}</p>
            </div>
            <div className="rounded-xl border border-border/70 bg-background/80 px-2 py-1.5">
              <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Left</p>
              <p className="mt-0.5 text-xs font-semibold">{formatTime(remainingSeconds)}</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              className="w-full rounded-full sm:w-auto"
              onClick={goToPreviousTrack}
              disabled={!hasTracks}
            >
              <SkipBack className="h-4 w-4" />
              Previous
            </Button>
            <Button
              type="button"
              className="w-full rounded-full sm:w-auto"
              onClick={togglePlayback}
              disabled={!hasTracks}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
              {isPlaying ? 'Pause' : 'Play'}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full rounded-full sm:w-auto"
              disabled={!hasTracks}
              onClick={goToNextTrack}
            >
              <SkipForward className="h-4 w-4" />
              Next track
            </Button>
            <Button type="button" variant="ghost" className="w-full rounded-full sm:w-auto" onClick={closePlayback} disabled={!hasTracks}>
              <X className="h-4 w-4" />
              Close
            </Button>
            <Link href="/music" className="text-sm font-medium text-cyan-600 hover:underline">
              Open music
            </Link>
          </div>
        </div>
      ) : (
        <p className="mt-4 rounded-xl border border-dashed border-border/70 bg-background/70 p-3 text-sm text-muted-foreground">
          Create a playlist to activate quick player.
        </p>
      )}
    </motion.article>
  );
}
