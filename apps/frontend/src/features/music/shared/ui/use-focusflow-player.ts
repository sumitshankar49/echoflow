'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { PlaylistTrack } from '../domain/music.utils';

export function useFocusFlowPlayer(tracks: PlaylistTrack[]) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const lastProgressEventAtRef = useRef<number>(Date.now());

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
    setDurationSeconds(0);
    lastProgressEventAtRef.current = Date.now();
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

  useEffect(() => {
    if (!isPlaying || !activeTrack) {
      return;
    }

    const timer = window.setInterval(() => {
      const recentlyUpdatedByMedia = Date.now() - lastProgressEventAtRef.current < 1600;
      if (recentlyUpdatedByMedia) {
        return;
      }

      setElapsedSeconds((current) => current + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [activeTrack, isPlaying]);

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
      lastProgressEventAtRef.current = Date.now();
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

      setIsPlaying(false);
      if (durationSeconds > 0) {
        setElapsedSeconds(durationSeconds);
      }
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