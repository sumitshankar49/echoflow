'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/shared/api/client';

export type ResolvedTrackMetadata = {
  title: string;
  artist?: string;
  thumbnailUrl?: string;
};

const metadataCache = new Map<string, ResolvedTrackMetadata | null>();

function parseSpotifyTitle(value: string) {
  const byIndex = value.toLowerCase().lastIndexOf(' by ');
  if (byIndex > 0) {
    return {
      title: value.slice(0, byIndex).trim(),
      artist: value.slice(byIndex + 4).trim(),
    };
  }

  return { title: value.trim() };
}

function parseSoundCloudTitle(value: string) {
  const separatorIndex = value.indexOf(' - ');
  if (separatorIndex > 0) {
    return {
      artist: value.slice(0, separatorIndex).trim(),
      title: value.slice(separatorIndex + 3).trim(),
    };
  }

  return { title: value.trim() };
}

export async function resolveTrackMetadata(url: string): Promise<ResolvedTrackMetadata | null> {
  try {
    const response = await apiClient.get<{
      title?: string;
      artist?: string;
      thumbnailUrl?: string;
    }>('/music/playlists/link-metadata', {
      params: { url },
    });

    const payload = response.data;
    const title = payload.title?.trim();
    const artist = payload.artist?.trim();
    const thumbnailUrl = payload.thumbnailUrl?.trim();

    if (!title && !artist && !thumbnailUrl) {
      return null;
    }

    const parsedSpotify = title ? parseSpotifyTitle(title) : null;
    const parsedSoundCloud = title ? parseSoundCloudTitle(title) : null;

    return {
      title: parsedSpotify?.title || parsedSoundCloud?.title || title || 'Track',
      artist: artist || parsedSpotify?.artist || parsedSoundCloud?.artist,
      thumbnailUrl,
    };
  } catch {
    return null;
  }
}

export function useTrackMetadata(url?: string | null) {
  const [metadata, setMetadata] = useState<ResolvedTrackMetadata | null>(null);

  useEffect(() => {
    if (!url) {
      setMetadata(null);
      return;
    }

    if (metadataCache.has(url)) {
      setMetadata(metadataCache.get(url) ?? null);
      return;
    }

    let cancelled = false;

    resolveTrackMetadata(url).then((resolved) => {
      metadataCache.set(url, resolved);

      if (!cancelled) {
        setMetadata(resolved);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [url]);

  return metadata;
}
