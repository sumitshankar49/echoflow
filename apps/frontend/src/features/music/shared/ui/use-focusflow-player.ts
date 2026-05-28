'use client';

import { useMemo } from 'react';
import type { PlaylistTrack } from '../domain/music.utils';
import { useMusicPlayerStore } from '@/shared/store/music-player.store';

export function useFocusFlowPlayer(tracks: PlaylistTrack[]) {
  const queueSignature = useMemo(
    () => tracks.map((track) => track.url).join('||'),
    [tracks],
  );

  const storeQueueSignature = useMusicPlayerStore((state) => state.queueSignature);
  const storeTracks = useMusicPlayerStore((state) => state.tracks);
  const storeActiveIndex = useMusicPlayerStore((state) => state.activeIndex);
  const storeIsPlaying = useMusicPlayerStore((state) => state.isPlaying);
  const storeElapsedSeconds = useMusicPlayerStore((state) => state.elapsedSeconds);
  const storeDurationSeconds = useMusicPlayerStore((state) => state.durationSeconds);

  const loadQueue = useMusicPlayerStore((state) => state.loadQueue);
  const setPlaying = useMusicPlayerStore((state) => state.setPlaying);
  const togglePlayback = useMusicPlayerStore((state) => state.togglePlayback);
  const setElapsedSeconds = useMusicPlayerStore((state) => state.setElapsedSeconds);
  const setDurationSeconds = useMusicPlayerStore((state) => state.setDurationSeconds);
  const previousTrack = useMusicPlayerStore((state) => state.previousTrack);
  const nextTrack = useMusicPlayerStore((state) => state.nextTrack);
  const onTrackEnded = useMusicPlayerStore((state) => state.onTrackEnded);

  const isCurrentQueue = queueSignature.length > 0 && storeQueueSignature === queueSignature;
  const activeIndex = isCurrentQueue ? storeActiveIndex : 0;
  const activeTrack = isCurrentQueue ? storeTracks[storeActiveIndex] : null;
  const isPlaying = isCurrentQueue ? storeIsPlaying : false;
  const elapsedSeconds = isCurrentQueue ? storeElapsedSeconds : 0;

  const effectiveDurationSeconds = useMemo(() => {
    const mediaDuration = isCurrentQueue && Number.isFinite(storeDurationSeconds)
      ? storeDurationSeconds
      : 0;
    if (mediaDuration > 0) {
      return mediaDuration;
    }

    return activeTrack?.durationSeconds ?? 0;
  }, [activeTrack?.durationSeconds, isCurrentQueue, storeDurationSeconds]);

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

      loadQueue({
        playlistName: 'FocusFlow Playlist',
        tracks,
        startIndex: index,
        autoplay: true,
      });
    },
    onPlaybackStateChange: (playing: boolean) => {
      if (!isCurrentQueue) {
        return;
      }

      setPlaying(playing);
    },
    onProgressChange: (elapsed: number) => {
      if (!isCurrentQueue) {
        return;
      }

      setElapsedSeconds(elapsed);
    },
    onDurationChange: (duration: number) => {
      if (!isCurrentQueue) {
        return;
      }

      setDurationSeconds(duration);
    },
    onTrackEnded: () => {
      if (!isCurrentQueue) {
        return;
      }

      onTrackEnded();
    },
    onPlaybackError: () => {
      if (!isCurrentQueue) {
        return;
      }

      setPlaying(false);
      setElapsedSeconds(0);
    },
    togglePlayback: () => {
      if (!tracks.length) {
        return;
      }

      if (!isCurrentQueue) {
        loadQueue({
          playlistName: 'FocusFlow Playlist',
          tracks,
          startIndex: 0,
          autoplay: true,
        });
        return;
      }

      togglePlayback();
    },
    previousTrack: () => {
      if (!tracks.length) {
        return;
      }

      if (!isCurrentQueue) {
        loadQueue({
          playlistName: 'FocusFlow Playlist',
          tracks,
          startIndex: 0,
          autoplay: true,
        });
        return;
      }

      previousTrack();
    },
    nextTrack: () => {
      if (!tracks.length) {
        return;
      }

      if (!isCurrentQueue) {
        loadQueue({
          playlistName: 'FocusFlow Playlist',
          tracks,
          startIndex: 0,
          autoplay: true,
        });
        return;
      }

      nextTrack();
    },
  };
}