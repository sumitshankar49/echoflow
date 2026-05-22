import { useQuery } from '@tanstack/react-query';
import { notesService } from '../../../shared/data/notes.service';
import { notesQueryKeys } from '../../../shared/data/notes.query-keys';

export function useNoteList() {
  return useQuery({
    queryKey: notesQueryKeys.list(),
    queryFn: notesService.list,
  });
}
