import { useMutation } from '@tanstack/react-query';

import { focusService } from '../../shared/data/focus.service';
import type { CreateFocusSessionPayload } from '../../shared/domain/focus.types';

export function useRecordFocusSession() {
  return useMutation({
    mutationFn: (payload: CreateFocusSessionPayload) => focusService.createSession(payload),
  });
}
