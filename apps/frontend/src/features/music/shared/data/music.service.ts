import { apiClient } from '@/shared/api/client';
import type {
  Playlist,
  PlaylistApiResponse,
  CreatePlaylistPayload,
  UpdatePlaylistPayload,
  PaginatedResponse,
} from '../domain/music.types';

function normalizePlaylist(playlist: PlaylistApiResponse): Playlist {
  return {
    id: playlist.id,
    name: playlist.name,
    description: playlist.description ?? undefined,
    urls: playlist.urls ?? playlist.tracks ?? [],
    createdAt: playlist.createdAt,
    updatedAt: playlist.updatedAt,
  };
}

function extractPlaylists(
  payload: PlaylistApiResponse[] | PaginatedResponse<PlaylistApiResponse>,
): Playlist[] {
  if (Array.isArray(payload)) {
    return payload.map(normalizePlaylist);
  }

  if (payload && Array.isArray(payload.data)) {
    return payload.data.map(normalizePlaylist);
  }

  return [];
}

async function expandYouTubePlaylistUrls(urls: string[]): Promise<string[]> {
  const result: string[] = [];

  for (const rawValue of urls) {
    const value = rawValue.trim();
    if (!value) {
      continue;
    }

    let parsed: URL | null = null;
    try {
      parsed = new URL(value);
    } catch {
      parsed = null;
    }

    const host = parsed?.hostname?.replace(/^www\./, '').toLowerCase();
    const listParam = parsed?.searchParams.get('list')?.trim();
    const isYouTube = host?.includes('youtube.com') || host?.includes('youtu.be');

    if (isYouTube && listParam) {
      try {
        const response = await apiClient.get<{ tracks?: string[] }>('/music/playlists/youtube-playlist-tracks', {
          params: { url: value },
        });

        const expandedTracks = response.data?.tracks?.filter(Boolean) ?? [];
        if (expandedTracks.length > 0) {
          result.push(...expandedTracks);
          continue;
        }
      } catch {
        // If expansion fails, keep original URL as fallback.
      }
    }

    result.push(value);
  }

  return Array.from(new Set(result));
}

export const musicService = {
  list: () =>
    apiClient
      .get<PlaylistApiResponse[] | PaginatedResponse<PlaylistApiResponse>>('/music/playlists')
      .then((r) => extractPlaylists(r.data)),
  get: (id: string) =>
    apiClient.get<PlaylistApiResponse>(`/music/playlists/${id}`).then((r) => normalizePlaylist(r.data)),
  create: async (payload: CreatePlaylistPayload) => {
    const expandedUrls = await expandYouTubePlaylistUrls(payload.urls ?? []);

    return apiClient
      .post<PlaylistApiResponse>('/music/playlists', {
        name: payload.name,
        description: payload.description,
        tracks: expandedUrls,
      })
      .then((r) => normalizePlaylist(r.data));
  },
  update: async (id: string, payload: UpdatePlaylistPayload) => {
    const expandedUrls = payload.urls !== undefined
      ? await expandYouTubePlaylistUrls(payload.urls)
      : undefined;

    return apiClient
      .patch<PlaylistApiResponse>(`/music/playlists/${id}`, {
        ...(payload.name !== undefined ? { name: payload.name } : {}),
        ...(payload.description !== undefined ? { description: payload.description } : {}),
        ...(expandedUrls !== undefined ? { tracks: expandedUrls } : {}),
      })
      .then((r) => normalizePlaylist(r.data));
  },
  remove: (id: string) => apiClient.delete(`/music/playlists/${id}`).then((r) => r.data),
};
