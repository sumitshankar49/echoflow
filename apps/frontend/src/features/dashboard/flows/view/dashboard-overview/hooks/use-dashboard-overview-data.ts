import { useQuery } from '@tanstack/react-query';

import { dashboardOverviewApi } from '../api/dashboard-overview.api';
import {
  createDashboardOverviewViewModel,
  type DashboardOverviewViewModel,
} from '../shared/dashboard-overview.mappers';
import { usePlaylistList } from '@/features/music/flows/view/list/use-playlist-list';

const MUSIC_FAVORITE_PLAYLISTS_STORAGE_KEY = 'music_favorite_playlists';

function readFavoritePlaylistIds(): string[] {
  if (typeof window === 'undefined') {
    return [];
  }

  const saved = localStorage.getItem(MUSIC_FAVORITE_PLAYLISTS_STORAGE_KEY);
  if (!saved) {
    return [];
  }

  try {
    const parsed = JSON.parse(saved) as string[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

type DashboardDataState = DashboardOverviewViewModel & {
  isOverviewPending: boolean;
};

export function useDashboardOverviewData(): DashboardDataState {
  const { data: overview, isPending: isOverviewPending } = useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: dashboardOverviewApi.getOverview,
  });
  const { data: playlists = [] } = usePlaylistList();
  const favoritePlaylistIds = readFavoritePlaylistIds();

  const favoritePlaylist = favoritePlaylistIds
    .map((favoriteId) => playlists.find((playlist) => playlist.id === favoriteId))
    .find((playlist) => playlist !== undefined);
  const quickPlayerPlaylistOverride = favoritePlaylistIds.length > 0 ? favoritePlaylist ?? null : null;

  return {
    ...createDashboardOverviewViewModel(overview, quickPlayerPlaylistOverride),
    isOverviewPending,
  };
}
