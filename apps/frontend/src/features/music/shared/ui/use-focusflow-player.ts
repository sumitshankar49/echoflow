'use client';

import { useEffect, useState } from 'react';
import type { PlaylistTrack } from '../domain/music.utils';

export function useFocusFlowPlayer(tracks: PlaylistTrack[]) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

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
  }, [activeIndex, tracks]);

  useEffect(() => {
    const activeTrack = tracks[activeIndex];

    if (!isPlaying || !activeTrack) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setElapsedSeconds((current) => {
        if (current >= activeTrack.durationSeconds) {
          if (tracks.length > 1) {
            setActiveIndex((value) => (value + 1) % tracks.length);
          }
          return 0;
        }

        return current + 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [activeIndex, isPlaying, tracks]);

  const activeTrack = tracks[activeIndex];
  const progress = activeTrack ? Math.min((elapsedSeconds / activeTrack.durationSeconds) * 100, 100) : 0;

  return {
    activeIndex,
    activeTrack,
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