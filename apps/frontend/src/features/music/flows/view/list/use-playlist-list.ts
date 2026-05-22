import { useQuery } from '@tanstack/react-query';
import { musicService } from '../../../shared/data/music.service';
import { musicQueryKeys } from '../../../shared/data/music.query-keys';

export function usePlaylistList() {
  return useQuery({
    queryKey: musicQueryKeys.playlists(),
    queryFn: musicService.list,
  });
}
