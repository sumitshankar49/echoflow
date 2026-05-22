import { apiClient } from '@/shared/api/client';
import type { Playlist, CreatePlaylistPayload, UpdatePlaylistPayload } from '../domain/music.types';

export const musicService = {
  list: () => apiClient.get<Playlist[]>('/music/playlists').then((r) => r.data),
  get: (id: string) => apiClient.get<Playlist>(`/music/playlists/${id}`).then((r) => r.data),
  create: (payload: CreatePlaylistPayload) =>
    apiClient.post<Playlist>('/music/playlists', payload).then((r) => r.data),
  update: (id: string, payload: UpdatePlaylistPayload) =>
    apiClient.patch<Playlist>(`/music/playlists/${id}`, payload).then((r) => r.data),
  remove: (id: string) => apiClient.delete(`/music/playlists/${id}`).then((r) => r.data),
};
