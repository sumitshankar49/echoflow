'use client';

import { useEffect, useMemo, useState } from 'react';
import type { PlaylistTrack } from '../domain/music.utils';

export function useFocusFlowPlayer(tracks: PlaylistTrack[]) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [durationSeconds, setDurationSeconds] = useState(0);

  useEffect(() => {
    if (!tracks.length) {
      setActiveIndex(0);
      setIsPlaying(false);
      setElapsedSeconds(0);
      return;
    }

    if (activeIndex > tracks.length - 1) {
      setActiveIndex(0);
    }
  }, [activeIndex, tracks]);

  useEffect(() => {
    setElapsedSeconds(0);
    setDurationSeconds(tracks[activeIndex]?.durationSeconds ?? 0);
  }, [activeIndex, tracks]);

  const activeTrack = tracks[activeIndex];
  const effectiveDurationSeconds = useMemo(() => {
    const mediaDuration = Number.isFinite(durationSeconds) ? durationSeconds : 0;
    if (mediaDuration > 0) {
      return mediaDuration;
    }

    return activeTrack?.durationSeconds ?? 0;
  }, [activeTrack?.durationSeconds, durationSeconds]);

  const progress =
    effectiveDurationSeconds > 0
      ? Math.min((elapsedSeconds / effectiveDurationSeconds) * 100, 100)
      : 0;

  return {
    activeIndex,
    activeTrack,
    durationSeconds: effectiveDurationSeconds,
    elapsedSeconds,
    isPlaying,
    progress,
    playTrack: (index: number) => {
      if (!tracks[index]) {
        return;
      }

      setActiveIndex(index);
      setElapsedSeconds(0);
      setIsPlaying(true);
    },
    onPlaybackStateChange: (playing: boolean) => {
      setIsPlaying(playing);
    },
    onProgressChange: (elapsed: number) => {
      setElapsedSeconds(Math.max(0, Math.floor(elapsed)));
    },
    onDurationChange: (duration: number) => {
      if (!Number.isFinite(duration) || duration <= 0) {
        return;
      }

      setDurationSeconds(Math.floor(duration));
    },
    onTrackEnded: () => {
      if (!tracks.length) {
        return;
      }

      if (tracks.length > 1) {
        setActiveIndex((value) => (value + 1) % tracks.length);
      }

      setElapsedSeconds(0);
      setIsPlaying(true);
    },
    onPlaybackError: () => {
      setIsPlaying(false);
      setElapsedSeconds(0);
    },
    togglePlayback: () => {
      if (!tracks.length) {
        return;
      }

      setIsPlaying((value) => !value);
    },
    previousTrack: () => {
      if (!tracks.length) {
        return;
      }

      setActiveIndex((value) => (value - 1 + tracks.length) % tracks.length);
      setElapsedSeconds(0);
    },
    nextTrack: () => {
      if (!tracks.length) {
        return;
      }

      setActiveIndex((value) => (value + 1) % tracks.length);
      setElapsedSeconds(0);
    },
  };
}