import { useMutation, useQueryClient } from '@tanstack/react-query';
import { circlesService } from '../../../shared/data/circles.service';
import { circlesQueryKeys } from '../../../shared/data/circles.query-keys';

export function useInviteMember(circleId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof circlesService.invite>[1]) =>
      circlesService.invite(circleId, payload),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: circlesQueryKeys.detail(circleId) }),
  });
}
