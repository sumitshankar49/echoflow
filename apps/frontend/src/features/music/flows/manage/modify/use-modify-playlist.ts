import { useMutation, useQueryClient } from '@tanstack/react-query';
import { musicService } from '../../shared/data/music.service';
import { musicQueryKeys } from '../../shared/data/music.query-keys';

export function useUpdatePlaylist(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof musicService.update>[1]) =>
      musicService.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: musicQueryKeys.playlists() });
      qc.invalidateQueries({ queryKey: musicQueryKeys.playlist(id) });
    },
  });
}

export function useDeletePlaylist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: musicService.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: musicQueryKeys.playlists() }),
  });
}
