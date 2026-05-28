'use client';

import dynamic from 'next/dynamic';

import { useMusicPlayerStore } from '@/shared/store/music-player.store';

const ReactPlayer = dynamic(() => import('react-player'), { ssr: false });

function extractElapsedSeconds(payload: unknown): number | null {
  if (typeof payload === 'number' && Number.isFinite(payload)) {
    return payload;
  }

  if (payload && typeof payload === 'object') {
    const value = payload as {
      playedSeconds?: number;
      currentTime?: number;
      seconds?: number;
      mediaTime?: number;
      detail?: {
        playedSeconds?: number;
        currentTime?: number;
        seconds?: number;
        mediaTime?: number;
      };
      currentTarget?: { currentTime?: number };
      target?: { currentTime?: number };
    };

    if (typeof value.playedSeconds === 'number' && Number.isFinite(value.playedSeconds)) {
      return value.playedSeconds;
    }

    if (typeof value.currentTime === 'number' && Number.isFinite(value.currentTime)) {
      return value.currentTime;
    }

    if (typeof value.seconds === 'number' && Number.isFinite(value.seconds)) {
      return value.seconds;
    }

    if (typeof value.mediaTime === 'number' && Number.isFinite(value.mediaTime)) {
      return value.mediaTime;
    }

    if (typeof value.detail?.playedSeconds === 'number' && Number.isFinite(value.detail.playedSeconds)) {
      return value.detail.playedSeconds;
    }

    if (typeof value.detail?.currentTime === 'number' && Number.isFinite(value.detail.currentTime)) {
      return value.detail.currentTime;
    }

    if (typeof value.detail?.seconds === 'number' && Number.isFinite(value.detail.seconds)) {
      return value.detail.seconds;
    }

    if (typeof value.detail?.mediaTime === 'number' && Number.isFinite(value.detail.mediaTime)) {
      return value.detail.mediaTime;
    }

    if (typeof value.currentTarget?.currentTime === 'number' && Number.isFinite(value.currentTarget.currentTime)) {
      return value.currentTarget.currentTime;
    }

    if (typeof value.target?.currentTime === 'number' && Number.isFinite(value.target.currentTime)) {
      return value.target.currentTime;
    }
  }

  return null;
}

function extractDurationSeconds(payload: unknown): number | null {
  if (typeof payload === 'number' && Number.isFinite(payload)) {
    return payload;
  }

  if (payload && typeof payload === 'object') {
    const value = payload as {
      duration?: number;
      detail?: { duration?: number };
      currentTarget?: { duration?: number };
      target?: { duration?: number };
    };

    if (typeof value.duration === 'number' && Number.isFinite(value.duration)) {
      return value.duration;
    }

    if (typeof value.detail?.duration === 'number' && Number.isFinite(value.detail.duration)) {
      return value.detail.duration;
    }

    if (typeof value.currentTarget?.duration === 'number' && Number.isFinite(value.currentTarget.duration)) {
      return value.currentTarget.duration;
    }

    if (typeof value.target?.duration === 'number' && Number.isFinite(value.target.duration)) {
      return value.target.duration;
    }
  }

  return null;
}

export function GlobalMusicPlaybackEngine() {
  const tracks = useMusicPlayerStore((state) => state.tracks);
  const activeIndex = useMusicPlayerStore((state) => state.activeIndex);
  const isPlaying = useMusicPlayerStore((state) => state.isPlaying);

  const setPlaying = useMusicPlayerStore((state) => state.setPlaying);
  const setElapsedSeconds = useMusicPlayerStore((state) => state.setElapsedSeconds);
  const setDurationSeconds = useMusicPlayerStore((state) => state.setDurationSeconds);
  const onTrackEnded = useMusicPlayerStore((state) => state.onTrackEnded);

  const activeTrack = tracks[activeIndex];
  if (!activeTrack) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed -left-[9999px] top-0 h-0 w-0 overflow-hidden opacity-0" aria-hidden>
      <ReactPlayer
        key={activeTrack.url}
        src={activeTrack.url}
        playing={isPlaying}
        controls={false}
        muted={false}
        volume={0.85}
        playsInline
        width="0"
        height="0"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
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
        onEnded={onTrackEnded}
        onError={() => {
          setPlaying(false);
        }}
      />
    </div>
  );
}
