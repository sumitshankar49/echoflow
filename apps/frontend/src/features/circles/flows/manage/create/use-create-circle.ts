import { useMutation, useQueryClient } from '@tanstack/react-query';
import { circlesService } from '../../shared/data/circles.service';
import { circlesQueryKeys } from '../../shared/data/circles.query-keys';

export function useCreateCircle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: circlesService.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: circlesQueryKeys.list() }),
  });
}
