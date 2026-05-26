import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useDashboardOverviewData } from './use-dashboard-overview-data';
import { dashboardOverviewApi } from '../api/dashboard-overview.api';
import { usePlaylistList } from '@/features/music/flows/view/list/use-playlist-list';

const useQueryMock = vi.fn();

vi.mock('@tanstack/react-query', () => ({
  useQuery: (...args: any[]) => useQueryMock(...args),
}));

vi.mock('@/features/music/flows/view/list/use-playlist-list', () => ({
  usePlaylistList: vi.fn(),
}));

const mockedUsePlaylistList = vi.mocked(usePlaylistList);

describe('useDashboardOverviewData', () => {
  beforeEach(() => {
    useQueryMock.mockReset();
    mockedUsePlaylistList.mockReset();
    mockedUsePlaylistList.mockReturnValue({ data: [] } as unknown as ReturnType<typeof usePlaylistList>);
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    });
  });

  it('wires dashboard overview query key and function', () => {
    useQueryMock.mockReturnValue({ data: undefined, isPending: true });

    const result = useDashboardOverviewData();

    expect(useQueryMock).toHaveBeenCalledWith({
      queryKey: ['dashboard', 'overview'],
      queryFn: dashboardOverviewApi.getOverview,
    });
    expect(result.isOverviewPending).toBe(true);
  });

  it('maps overview payload and builds smart suggestions', () => {
    mockedUsePlaylistList.mockReturnValue({
      data: [
        {
          id: 'p-1',
          name: 'Focus Mix',
          urls: ['https://www.youtube.com/watch?v=abc'],
          createdAt: '2026-05-26T08:00:00.000Z',
        },
      ],
    } as unknown as ReturnType<typeof usePlaylistList>);
    vi.mocked(localStorage.getItem).mockReturnValueOnce(JSON.stringify(['p-1']));

    useQueryMock.mockReturnValue({
      isPending: false,
      data: {
        me: { name: 'Candy User' },
        summary: {
          notesCount: 10,
          pendingRemindersCount: 4,
          activeCirclesCount: 2,
          playlistsCount: 1,
        },
        recentNotes: [
          {
            id: 'n-1',
            title: 'Roadmap',
            content: 'Q3 plan',
            updatedAt: '2026-05-26T09:00:00.000Z',
          },
        ],
        upcomingReminders: [
          {
            id: 'r-1',
            title: 'Standup',
            remindAt: '2026-05-26T10:00:00.000Z',
          },
        ],
        activeCircles: [
          {
            id: 'c-1',
            name: 'Team Circle',
            members: [],
          },
        ],
        quickPlayerPlaylist: null,
      },
    });

    const result = useDashboardOverviewData();

    expect(result.me).toEqual({ name: 'Candy User' });
    expect(result.notesCount).toBe(10);
    expect(result.pendingRemindersCount).toBe(4);
    expect(result.activeCirclesCount).toBe(2);
    expect(result.recentNotes).toHaveLength(1);
    expect(result.topReminders).toHaveLength(1);
    expect(result.quickPlayerPlaylist?.name).toBe('Focus Mix');
    expect(result.smartSuggestions.map((item) => item.id)).toEqual([
      'reminder-focus',
      'circle-touchpoint',
      'music-ritual',
    ]);
  });

  it('hides quick player when no favorite playlist is selected', () => {
    mockedUsePlaylistList.mockReturnValue({
      data: [
        {
          id: 'p-1',
          name: 'Focus Mix',
          urls: ['https://www.youtube.com/watch?v=abc'],
          createdAt: '2026-05-26T08:00:00.000Z',
        },
      ],
    } as unknown as ReturnType<typeof usePlaylistList>);
    vi.mocked(localStorage.getItem).mockReturnValueOnce(JSON.stringify([]));

    useQueryMock.mockReturnValue({
      isPending: false,
      data: {
        me: { name: 'Candy User' },
        summary: {
          notesCount: 10,
          pendingRemindersCount: 0,
          activeCirclesCount: 0,
          playlistsCount: 1,
        },
        recentNotes: [],
        upcomingReminders: [],
        activeCircles: [],
        quickPlayerPlaylist: {
          id: 'fallback',
          name: 'Recent Playlist',
          urls: ['https://www.youtube.com/watch?v=fallback'],
        },
      },
    });

    const result = useDashboardOverviewData();

    expect(result.quickPlayerPlaylist).toBeUndefined();
    expect(result.smartSuggestions).toEqual([
      {
        id: 'bootstrap',
        title: 'Create your first workflow loop',
        description:
          'Add one note, one reminder, and one playlist to activate your full EchoFlow dashboard experience.',
        href: '/notes',
      },
    ]);
  });

  it('returns bootstrap suggestion when no data is available', () => {
    useQueryMock.mockReturnValue({
      isPending: false,
      data: {
        me: null,
        summary: {
          notesCount: 0,
          pendingRemindersCount: 0,
          activeCirclesCount: 0,
          playlistsCount: 0,
        },
        recentNotes: [],
        upcomingReminders: [],
        activeCircles: [],
        quickPlayerPlaylist: null,
      },
    });

    const result = useDashboardOverviewData();

    expect(result.smartSuggestions).toEqual([
      {
        id: 'bootstrap',
        title: 'Create your first workflow loop',
        description:
          'Add one note, one reminder, and one playlist to activate your full EchoFlow dashboard experience.',
        href: '/notes',
      },
    ]);
  });
});
