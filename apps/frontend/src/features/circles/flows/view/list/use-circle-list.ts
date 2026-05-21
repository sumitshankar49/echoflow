import { useQuery } from '@tanstack/react-query';
import { circlesService } from '../../shared/data/circles.service';
import { circlesQueryKeys } from '../../shared/data/circles.query-keys';

export function useCircleList() {
  return useQuery({
    queryKey: circlesQueryKeys.list(),
    queryFn: circlesService.list,
  });
}
