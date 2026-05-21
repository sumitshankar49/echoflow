import { useQuery } from '@tanstack/react-query';
import { circlesService } from '../../shared/data/circles.service';
import { circlesQueryKeys } from '../../shared/data/circles.query-keys';

export function useCircleDetail(id: string) {
  return useQuery({
    queryKey: circlesQueryKeys.detail(id),
    queryFn: () => circlesService.get(id),
    enabled: Boolean(id),
  });
}
