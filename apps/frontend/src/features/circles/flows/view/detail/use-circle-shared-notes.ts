import { useQuery } from '@tanstack/react-query';

import { circlesService } from '../../../shared/data/circles.service';
import { circlesQueryKeys } from '../../../shared/data/circles.query-keys';

export function useCircleSharedNotes(id: string) {
  return useQuery({
    queryKey: circlesQueryKeys.sharedNotes(id),
    queryFn: () => circlesService.listSharedNotes(id),
    enabled: Boolean(id),
  });
}