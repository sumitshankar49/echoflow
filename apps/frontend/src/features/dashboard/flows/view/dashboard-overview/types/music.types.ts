import type { Playlist } from '@/features/music/shared/domain/music.types';

export type DashboardPlaylist = Pick<Playlist, 'id' | 'name' | 'urls'>;
