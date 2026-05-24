import { useMutation, useQueryClient } from '@tanstack/react-query';
import { musicService } from '../../../shared/data/music.service';
import { musicQueryKeys } from '../../../shared/data/music.query-keys';

export function useRemovePlaylist() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => musicService.remove(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: musicQueryKeys.playlists() });
      qc.invalidateQueries({ queryKey: musicQueryKeys.playlist(id) });
    },
  });
}