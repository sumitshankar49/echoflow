import { useMemo } from 'react';

import { useMusicPlayerStore } from '@/shared/store/music-player.store';

import type { DashboardPlaylist } from '../types';

type DashboardPlayerState = {
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

export function useDashboardPlayer(_quickPlayerPlaylist: DashboardPlaylist | undefined): DashboardPlayerState {
  const playlistName = useMusicPlayerStore((state) => state.playlistName);
  const tracks = useMusicPlayerStore((state) => state.tracks);
  const trackIndex = useMusicPlayerStore((state) => state.activeIndex);
  const isPlaying = useMusicPlayerStore((state) => state.isPlaying);
  const elapsedSeconds = useMusicPlayerStore((state) => state.elapsedSeconds);
  const durationSeconds = useMusicPlayerStore((state) => state.durationSeconds);

  const togglePlayback = useMusicPlayerStore((state) => state.togglePlayback);
  const closePlayback = useMusicPlayerStore((state) => state.clearPlayback);
  const goToPreviousTrack = useMusicPlayerStore((state) => state.previousTrack);
  const goToNextTrack = useMusicPlayerStore((state) => state.nextTrack);

  const activeTrack = tracks[trackIndex];
  const activeTrackUrl = activeTrack?.url ?? '';
  const activeTrackTitle = activeTrack?.title ?? '';
  const hasTracks = tracks.length > 0;

  const safeElapsed = Math.max(0, elapsedSeconds);
  const safeDuration = Math.max(0, durationSeconds || activeTrack?.durationSeconds || 0);
  const remainingSeconds = Math.max(0, safeDuration - safeElapsed);

  const musicProgress = useMemo(
    () => (safeDuration > 0 ? Math.min(100, (safeElapsed / safeDuration) * 100) : 0),
    [safeDuration, safeElapsed],
  );

  return {
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
  };
}
