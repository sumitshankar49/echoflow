import { useMutation, useQueryClient } from '@tanstack/react-query';
import { musicService } from '../../../shared/data/music.service';
import { musicQueryKeys } from '../../../shared/data/music.query-keys';

export function useCreatePlaylist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: musicService.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: musicQueryKeys.playlists() }),
  });
}
