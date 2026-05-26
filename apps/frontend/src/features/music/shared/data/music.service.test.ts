import { beforeEach, describe, expect, it, vi } from 'vitest';

import { musicService } from './music.service';
import { apiClient } from '@/shared/api/client';

vi.mock('@/shared/api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockedApiClient = vi.mocked(apiClient);

describe('musicService', () => {
  beforeEach(() => {
    mockedApiClient.get.mockReset();
    mockedApiClient.post.mockReset();
    mockedApiClient.patch.mockReset();
    mockedApiClient.delete.mockReset();
  });

  it('normalizes list response from paginated payload', async () => {
    mockedApiClient.get.mockResolvedValueOnce({
      data: {
        data: [
          {
            id: 'playlist-1',
            name: 'Focus Lane',
            description: null,
            tracks: ['https://example.com/a.mp3'],
            createdAt: '2026-05-26T00:00:00.000Z',
            updatedAt: '2026-05-26T00:00:00.000Z',
          },
        ],
        total: 1,
        page: 1,
        totalPages: 1,
      },
    });

    await expect(musicService.list()).resolves.toEqual([
      {
        id: 'playlist-1',
        name: 'Focus Lane',
        description: undefined,
        urls: ['https://example.com/a.mp3'],
        createdAt: '2026-05-26T00:00:00.000Z',
        updatedAt: '2026-05-26T00:00:00.000Z',
      },
    ]);

    expect(mockedApiClient.get).toHaveBeenCalledWith('/music/playlists');
  });

  it('expands youtube playlist tracks on create when backend returns expanded tracks', async () => {
    mockedApiClient.get.mockResolvedValueOnce({
      data: { tracks: ['https://youtube.com/watch?v=111', 'https://youtube.com/watch?v=222'] },
    });
    mockedApiClient.post.mockResolvedValueOnce({
      data: {
        id: 'playlist-2',
        name: 'Expanded',
        description: 'desc',
        urls: ['https://youtube.com/watch?v=111', 'https://youtube.com/watch?v=222'],
        createdAt: '2026-05-26T00:00:00.000Z',
      },
    });

    await musicService.create({
      name: 'Expanded',
      description: 'desc',
      urls: ['https://www.youtube.com/watch?v=abc123&list=PL123'],
    });

    expect(mockedApiClient.get).toHaveBeenCalledWith('/music/playlists/youtube-playlist-tracks', {
      params: { url: 'https://www.youtube.com/watch?v=abc123&list=PL123' },
    });
    expect(mockedApiClient.post).toHaveBeenCalledWith('/music/playlists', {
      name: 'Expanded',
      description: 'desc',
      tracks: ['https://youtube.com/watch?v=111', 'https://youtube.com/watch?v=222'],
    });
  });

  it('falls back to original url when youtube expansion fails', async () => {
    mockedApiClient.get.mockRejectedValueOnce(new Error('expansion failed'));
    mockedApiClient.post.mockResolvedValueOnce({
      data: {
        id: 'playlist-3',
        name: 'Fallback',
        description: 'desc',
        tracks: ['https://www.youtube.com/watch?v=abc123&list=PL456'],
        createdAt: '2026-05-26T00:00:00.000Z',
      },
    });

    await musicService.create({
      name: 'Fallback',
      description: 'desc',
      urls: ['https://www.youtube.com/watch?v=abc123&list=PL456'],
    });

    expect(mockedApiClient.post).toHaveBeenCalledWith('/music/playlists', {
      name: 'Fallback',
      description: 'desc',
      tracks: ['https://www.youtube.com/watch?v=abc123&list=PL456'],
    });
  });

  it('updates and removes playlist with expected endpoints', async () => {
    mockedApiClient.patch.mockResolvedValueOnce({
      data: {
        id: 'playlist-4',
        name: 'Updated Name',
        description: null,
        urls: ['https://example.com/x'],
        createdAt: '2026-05-26T00:00:00.000Z',
      },
    });
    mockedApiClient.delete.mockResolvedValueOnce({ data: { ok: true } });

    await expect(musicService.update('playlist-4', { name: 'Updated Name' })).resolves.toEqual({
      id: 'playlist-4',
      name: 'Updated Name',
      description: undefined,
      urls: ['https://example.com/x'],
      createdAt: '2026-05-26T00:00:00.000Z',
      updatedAt: undefined,
    });
    await expect(musicService.remove('playlist-4')).resolves.toEqual({ ok: true });

    expect(mockedApiClient.patch).toHaveBeenCalledWith('/music/playlists/playlist-4', {
      name: 'Updated Name',
    });
    expect(mockedApiClient.delete).toHaveBeenCalledWith('/music/playlists/playlist-4');
  });
});
