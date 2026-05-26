import { beforeEach, describe, expect, it, vi } from 'vitest';

import { remindersService } from './reminders.service';
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

describe('remindersService', () => {
  beforeEach(() => {
    mockedApiClient.get.mockReset();
    mockedApiClient.post.mockReset();
    mockedApiClient.patch.mockReset();
    mockedApiClient.delete.mockReset();
  });

  it('returns paginated response for list and normalizes description', async () => {
    mockedApiClient.get.mockResolvedValueOnce({
      data: {
        data: [
          {
            id: 'r-1',
            title: 'Standup',
            remindAt: '2026-05-26T10:00:00.000Z',
            description: undefined,
            isCompleted: false,
          },
        ],
        total: 1,
        page: 1,
        totalPages: 1,
      },
    });

    await expect(remindersService.list({ isCompleted: false })).resolves.toEqual({
      data: [
        {
          id: 'r-1',
          title: 'Standup',
          remindAt: '2026-05-26T10:00:00.000Z',
          description: null,
          isCompleted: false,
        },
      ],
      total: 1,
      page: 1,
      totalPages: 1,
    });

    expect(mockedApiClient.get).toHaveBeenCalledWith('/reminders', {
      params: { isCompleted: false },
    });
  });

  it('returns flat list for listAll and supports create/update/remove', async () => {
    mockedApiClient.get.mockResolvedValueOnce({
      data: [
        {
          id: 'r-2',
          title: 'Pay bill',
          remindAt: '2026-05-27T10:00:00.000Z',
          description: 'Utility',
          isCompleted: false,
        },
      ],
    });
    mockedApiClient.post.mockResolvedValueOnce({
      data: {
        id: 'r-3',
        title: 'New reminder',
        remindAt: '2026-05-28T10:00:00.000Z',
        description: undefined,
        isCompleted: false,
      },
    });
    mockedApiClient.patch.mockResolvedValueOnce({
      data: {
        id: 'r-3',
        title: 'Updated reminder',
        remindAt: '2026-05-28T10:00:00.000Z',
        description: undefined,
        isCompleted: false,
      },
    });
    mockedApiClient.delete.mockResolvedValueOnce({ data: { ok: true } });

    await expect(remindersService.listAll()).resolves.toEqual([
      {
        id: 'r-2',
        title: 'Pay bill',
        remindAt: '2026-05-27T10:00:00.000Z',
        description: 'Utility',
        isCompleted: false,
      },
    ]);
    await expect(
      remindersService.create({ title: 'New reminder', remindAt: '2026-05-28T10:00:00.000Z' }),
    ).resolves.toMatchObject({ id: 'r-3', description: null });
    await expect(remindersService.update('r-3', { title: 'Updated reminder' })).resolves.toMatchObject({
      title: 'Updated reminder',
      description: null,
    });
    await expect(remindersService.remove('r-3')).resolves.toEqual({ ok: true });

    expect(mockedApiClient.patch).toHaveBeenCalledWith('/reminders/r-3', {
      title: 'Updated reminder',
    });
  });
});
