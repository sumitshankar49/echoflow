import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notesService } from '../../shared/data/notes.service';
import { notesQueryKeys } from '../../shared/data/notes.query-keys';

export function useCreateNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: notesService.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: notesQueryKeys.list() }),
  });
}
