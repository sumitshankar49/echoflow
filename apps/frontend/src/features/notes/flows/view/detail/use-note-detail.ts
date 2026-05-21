import { useQuery } from '@tanstack/react-query';
import { notesService } from '../../shared/data/notes.service';
import { notesQueryKeys } from '../../shared/data/notes.query-keys';

export function useNoteDetail(id: string) {
  return useQuery({
    queryKey: notesQueryKeys.detail(id),
    queryFn: () => notesService.get(id),
    enabled: Boolean(id),
  });
}
