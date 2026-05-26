import { motion } from 'framer-motion';
import Link from 'next/link';
import { Pause, Play, SkipBack, SkipForward, Waves } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { formatTime } from '@/features/music/shared/domain/music.utils';

import {
  extractDurationSeconds,
  extractElapsedSeconds,
  guessTrackName,
} from '../shared/dashboard-overview.utils';
import type { DashboardPlaylist } from '../types';

type MusicQuickPlayerCardProps = {
  quickPlayerPlaylist: DashboardPlaylist | undefined;
  activeTrackUrl: string;
  trackIndex: number;
  hasTracks: boolean;
  isPlaying: boolean;
  safeElapsed: number;
  safeDuration: number;
  remainingSeconds: number;
  musicProgress: number;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  setElapsedSeconds: React.Dispatch<React.SetStateAction<number>>;
  setDurationSeconds: React.Dispatch<React.SetStateAction<number>>;
  goToPreviousTrack: () => void;
  goToNextTrack: () => void;
  ReactPlayer: React.ComponentType<any>;
};

export function MusicQuickPlayerCard({
  quickPlayerPlaylist,
  activeTrackUrl,
  trackIndex,
  hasTracks,
  isPlaying,
  safeElapsed,
  safeDuration,
  remainingSeconds,
  musicProgress,
  setIsPlaying,
  setElapsedSeconds,
  setDurationSeconds,
  goToPreviousTrack,
  goToNextTrack,
  ReactPlayer,
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

      {quickPlayerPlaylist ? (
        <div className="mt-4 rounded-2xl border border-border/70 bg-background/70 p-4">
          {activeTrackUrl ? (
            <div
              className="pointer-events-none fixed -left-[9999px] top-0 h-0 w-0 overflow-hidden opacity-0"
              aria-hidden
            >
              <ReactPlayer
                key={activeTrackUrl}
                src={activeTrackUrl}
                playing={isPlaying}
                controls={false}
                muted={false}
                volume={1}
                playsInline
                width="0"
                height="0"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onTimeUpdate={(payload: unknown) => {
                  const elapsed = extractElapsedSeconds(payload);
                  if (elapsed !== null) {
                    setElapsedSeconds(elapsed);
                  }
                }}
                onProgress={(payload: unknown) => {
                  const elapsed = extractElapsedSeconds(payload);
                  if (elapsed !== null) {
                    setElapsedSeconds(elapsed);
                  }
                }}
                onDurationChange={(payload: unknown) => {
                  const duration = extractDurationSeconds(payload);
                  if (duration !== null && duration > 0) {
                    setDurationSeconds(duration);
                  }
                }}
                onEnded={goToNextTrack}
                onError={() => {
                  toast.error('This track could not be played from dashboard.');
                }}
              />
            </div>
          ) : null}

          <p className="font-medium">{quickPlayerPlaylist.name}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {activeTrackUrl ? guessTrackName(activeTrackUrl, trackIndex) : 'No tracks available'}
          </p>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-500"
              animate={{ width: `${musicProgress}%` }}
              transition={{ ease: 'linear', duration: 0.8 }}
            />
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
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
              className="rounded-full"
              onClick={goToPreviousTrack}
              disabled={!hasTracks}
            >
              <SkipBack className="h-4 w-4" />
              Previous
            </Button>
            <Button
              type="button"
              className="rounded-full"
              onClick={() => setIsPlaying((value) => !value)}
              disabled={!hasTracks}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
              {isPlaying ? 'Pause' : 'Play'}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              disabled={!hasTracks}
              onClick={goToNextTrack}
            >
              <SkipForward className="h-4 w-4" />
              Next track
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
