import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notesService } from '../../../shared/data/notes.service';
import { notesQueryKeys } from '../../../shared/data/notes.query-keys';

export function useUpdateNote(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof notesService.update>[1]) =>
      notesService.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notesQueryKeys.list() });
      qc.invalidateQueries({ queryKey: notesQueryKeys.detail(id) });
    },
  });
}
