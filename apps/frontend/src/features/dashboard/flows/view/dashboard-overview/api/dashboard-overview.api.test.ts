import { beforeEach, describe, expect, it, vi } from 'vitest';

import { dashboardOverviewApi } from './dashboard-overview.api';
import { apiClient } from '@/shared/api/client';

vi.mock('@/shared/api/client', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

const mockedApiClient = vi.mocked(apiClient);

describe('dashboardOverviewApi', () => {
  beforeEach(() => {
    mockedApiClient.get.mockReset();
  });

  it('fetches dashboard overview from backend endpoint', async () => {
    mockedApiClient.get.mockResolvedValueOnce({
      data: {
        me: { name: 'Candy User' },
        summary: {
          notesCount: 8,
          pendingRemindersCount: 3,
          activeCirclesCount: 2,
          playlistsCount: 1,
        },
        recentNotes: [],
        upcomingReminders: [],
        activeCircles: [],
        quickPlayerPlaylist: null,
      },
    });

    await expect(dashboardOverviewApi.getOverview()).resolves.toMatchObject({
      me: { name: 'Candy User' },
      summary: {
        notesCount: 8,
      },
    });

    expect(mockedApiClient.get).toHaveBeenCalledWith('/dashboard/overview');
  });
});
