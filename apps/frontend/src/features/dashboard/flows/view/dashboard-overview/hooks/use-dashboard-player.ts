import { useEffect, useMemo, useState } from 'react';

import type { DashboardPlaylist } from '../types';

type DashboardPlayerState = {
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
};

export function useDashboardPlayer(quickPlayerPlaylist: DashboardPlaylist | undefined): DashboardPlayerState {
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [trackIndex, setTrackIndex] = useState(0);

  const quickPlayerTracks = quickPlayerPlaylist?.urls ?? [];
  const activeTrackUrl = quickPlayerTracks[trackIndex] ?? '';
  const hasTracks = quickPlayerTracks.length > 0;

  const safeElapsed = Math.max(0, elapsedSeconds);
  const safeDuration = Math.max(0, durationSeconds);
  const remainingSeconds = Math.max(0, safeDuration - safeElapsed);

  const musicProgress = useMemo(
    () => (safeDuration > 0 ? Math.min(100, (safeElapsed / safeDuration) * 100) : 0),
    [safeDuration, safeElapsed],
  );

  const goToNextTrack = () => {
    if (!quickPlayerTracks.length) {
      return;
    }

    setTrackIndex((index) => (index + 1) % quickPlayerTracks.length);
    setElapsedSeconds(0);
    setDurationSeconds(0);
  };

  const goToPreviousTrack = () => {
    if (!quickPlayerTracks.length) {
      return;
    }

    setTrackIndex((index) => (index === 0 ? quickPlayerTracks.length - 1 : index - 1));
    setElapsedSeconds(0);
    setDurationSeconds(0);
  };

  useEffect(() => {
    if (!quickPlayerTracks.length) {
      setTrackIndex(0);
      setIsPlaying(false);
      setElapsedSeconds(0);
      setDurationSeconds(0);
      return;
    }

    if (trackIndex > quickPlayerTracks.length - 1) {
      setTrackIndex(0);
    }
  }, [quickPlayerTracks, trackIndex]);

  return {
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
  };
}
