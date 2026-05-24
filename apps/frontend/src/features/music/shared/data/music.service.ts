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

export const musicService = {
  list: () =>
    apiClient
      .get<PlaylistApiResponse[] | PaginatedResponse<PlaylistApiResponse>>('/music/playlists')
      .then((r) => extractPlaylists(r.data)),
  get: (id: string) =>
    apiClient.get<PlaylistApiResponse>(`/music/playlists/${id}`).then((r) => normalizePlaylist(r.data)),
  create: (payload: CreatePlaylistPayload) =>
    apiClient
      .post<PlaylistApiResponse>('/music/playlists', {
        name: payload.name,
        description: payload.description,
        tracks: payload.urls,
      })
      .then((r) => normalizePlaylist(r.data)),
  update: (id: string, payload: UpdatePlaylistPayload) =>
    apiClient
      .patch<PlaylistApiResponse>(`/music/playlists/${id}`, {
        ...(payload.name !== undefined ? { name: payload.name } : {}),
        ...(payload.description !== undefined ? { description: payload.description } : {}),
        ...(payload.urls !== undefined ? { tracks: payload.urls } : {}),
      })
      .then((r) => normalizePlaylist(r.data)),
  remove: (id: string) => apiClient.delete(`/music/playlists/${id}`).then((r) => r.data),
};
