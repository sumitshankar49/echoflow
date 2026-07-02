import { useMutation, useQueryClient } from '@tanstack/react-query';

import { focusQueryKeys } from '../../shared/data/focus.query-keys';
import { focusService } from '../../shared/data/focus.service';
import type { UpdateFocusSettingsPayload } from '../../shared/domain/focus.types';

export function useUpdateFocusSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateFocusSettingsPayload) => focusService.updateSettings(payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(focusQueryKeys.settings(), updated);
    },
  });
}
