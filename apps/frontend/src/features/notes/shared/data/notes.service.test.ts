import { beforeEach, describe, expect, it, vi } from 'vitest';

import { notesService } from './notes.service';
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

describe('notesService', () => {
  beforeEach(() => {
    mockedApiClient.get.mockReset();
    mockedApiClient.post.mockReset();
    mockedApiClient.patch.mockReset();
    mockedApiClient.delete.mockReset();
  });

  it('normalizes note flags and tags from list', async () => {
    mockedApiClient.get.mockResolvedValueOnce({
      data: {
        data: [
          {
            id: 'note-1',
            title: 'First',
            content: 'Content',
            tags: undefined,
            favorite: undefined,
            isFavorite: true,
          },
        ],
      },
    });

    await expect(notesService.list()).resolves.toEqual([
      {
        id: 'note-1',
        title: 'First',
        content: 'Content',
        tags: [],
        favorite: true,
        isFavorite: true,
      },
    ]);
  });

  it('falls back to client-side search when backend search fails', async () => {
    mockedApiClient.get
      .mockRejectedValueOnce(new Error('search route unavailable'))
      .mockResolvedValueOnce({
        data: [
          { id: 'a', title: 'Grocery List', content: 'Milk and bread', tags: [], favorite: false },
          { id: 'b', title: 'Work Plan', content: 'Ship frontend tests', tags: [], favorite: false },
        ],
      });

    const result = await notesService.search('frontEnd');

    expect(result).toEqual([
      {
        id: 'b',
        title: 'Work Plan',
        content: 'Ship frontend tests',
        tags: [],
        favorite: false,
        isFavorite: false,
      },
    ]);
  });

  it('calls create, update and remove endpoints', async () => {
    mockedApiClient.post.mockResolvedValueOnce({
      data: { id: 'new', title: 'New', content: 'Body', tags: [], favorite: true },
    });
    mockedApiClient.patch.mockResolvedValueOnce({
      data: { id: 'new', title: 'Updated', content: 'Body', tags: [], favorite: true },
    });
    mockedApiClient.delete.mockResolvedValueOnce({ data: { ok: true } });

    await expect(notesService.create({ title: 'New', content: 'Body' })).resolves.toMatchObject({ id: 'new' });
    await expect(notesService.update('new', { title: 'Updated' })).resolves.toMatchObject({ title: 'Updated' });
    await expect(notesService.remove('new')).resolves.toEqual({ ok: true });

    expect(mockedApiClient.post).toHaveBeenCalledWith('/notes', { title: 'New', content: 'Body' });
    expect(mockedApiClient.patch).toHaveBeenCalledWith('/notes/new', { title: 'Updated' });
    expect(mockedApiClient.delete).toHaveBeenCalledWith('/notes/new');
  });
});
