import { useQuery } from '@tanstack/react-query';
import { musicService } from '../../shared/data/music.service';
import { musicQueryKeys } from '../../shared/data/music.query-keys';

export function usePlaylistDetail(id: string) {
  return useQuery({
    queryKey: musicQueryKeys.playlist(id),
    queryFn: () => musicService.get(id),
    enabled: Boolean(id),
  });
}
