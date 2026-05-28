import { create } from 'zustand';

import type { PlaylistTrack } from '@/features/music/shared/domain/music.utils';

type LoadQueueInput = {
  playlistName: string;
  tracks: PlaylistTrack[];
  startIndex?: number;
  autoplay?: boolean;
};

type MusicPlayerStore = {
  playlistName: string;
  tracks: PlaylistTrack[];
  queueSignature: string;
  activeIndex: number;
  isPlaying: boolean;
  elapsedSeconds: number;
  durationSeconds: number;
  clearPlayback: () => void;
  loadQueue: (input: LoadQueueInput) => void;
  playTrack: (index: number) => void;
  setPlaying: (playing: boolean) => void;
  togglePlayback: () => void;
  setElapsedSeconds: (elapsedSeconds: number) => void;
  setDurationSeconds: (durationSeconds: number) => void;
  previousTrack: () => void;
  nextTrack: () => void;
  onTrackEnded: () => void;
};

const DEFAULT_PLAYLIST_NAME = 'FocusFlow Playlist';

const getQueueSignature = (tracks: PlaylistTrack[]): string => tracks.map((track) => track.url).join('||');

const clampIndex = (index: number, size: number): number => {
  if (size <= 0) {
    return 0;
  }

  if (index < 0) {
    return 0;
  }

  if (index > size - 1) {
    return size - 1;
  }

  return index;
};

export const useMusicPlayerStore = create<MusicPlayerStore>((set, get) => ({
  playlistName: DEFAULT_PLAYLIST_NAME,
  tracks: [],
  queueSignature: '',
  activeIndex: 0,
  isPlaying: false,
  elapsedSeconds: 0,
  durationSeconds: 0,
  clearPlayback: () => {
    set({
      tracks: [],
      queueSignature: '',
      activeIndex: 0,
      isPlaying: false,
      elapsedSeconds: 0,
      durationSeconds: 0,
    });
  },
  loadQueue: ({ playlistName, tracks, startIndex = 0, autoplay = false }: LoadQueueInput) => {
    if (!tracks.length) {
      return;
    }

    const queueSignature = getQueueSignature(tracks);

    set((state) => {
      const safeIndex = clampIndex(startIndex, tracks.length);
      const queueChanged = state.queueSignature !== queueSignature;

      if (!queueChanged && state.activeIndex === safeIndex) {
        return {
          playlistName,
          tracks,
          queueSignature,
          isPlaying: autoplay ? true : state.isPlaying,
        };
      }

      return {
        playlistName,
        tracks,
        queueSignature,
        activeIndex: safeIndex,
        elapsedSeconds: 0,
        durationSeconds: 0,
        isPlaying: autoplay ? true : queueChanged ? state.isPlaying : state.isPlaying,
      };
    });
  },
  playTrack: (index: number) => {
    const state = get();
    if (!state.tracks.length) {
      return;
    }

    set({
      activeIndex: clampIndex(index, state.tracks.length),
      elapsedSeconds: 0,
      durationSeconds: 0,
      isPlaying: true,
    });
  },
  setPlaying: (playing: boolean) => {
    set({ isPlaying: playing });
  },
  togglePlayback: () => {
    const state = get();
    if (!state.tracks.length) {
      return;
    }

    set({ isPlaying: !state.isPlaying });
  },
  setElapsedSeconds: (elapsedSeconds: number) => {
    set({ elapsedSeconds: Math.max(0, Math.floor(elapsedSeconds)) });
  },
  setDurationSeconds: (durationSeconds: number) => {
    if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
      return;
    }

    set({ durationSeconds: Math.floor(durationSeconds) });
  },
  previousTrack: () => {
    const state = get();
    if (!state.tracks.length) {
      return;
    }

    set({
      activeIndex: state.activeIndex === 0 ? state.tracks.length - 1 : state.activeIndex - 1,
      elapsedSeconds: 0,
      durationSeconds: 0,
      isPlaying: true,
    });
  },
  nextTrack: () => {
    const state = get();
    if (!state.tracks.length) {
      return;
    }

    set({
      activeIndex: (state.activeIndex + 1) % state.tracks.length,
      elapsedSeconds: 0,
      durationSeconds: 0,
      isPlaying: true,
    });
  },
  onTrackEnded: () => {
    const state = get();
    if (!state.tracks.length) {
      return;
    }

    const hasNextTrack = state.activeIndex < state.tracks.length - 1;

    if (hasNextTrack) {
      set({
        activeIndex: state.activeIndex + 1,
        elapsedSeconds: 0,
        durationSeconds: 0,
        isPlaying: true,
      });
      return;
    }

    set({
      isPlaying: false,
      elapsedSeconds: state.durationSeconds > 0 ? state.durationSeconds : state.elapsedSeconds,
    });
  },
}));
