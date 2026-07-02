import { useQuery } from '@tanstack/react-query';

import { focusQueryKeys } from '../../shared/data/focus.query-keys';
import { focusService } from '../../shared/data/focus.service';

export function useFocusSettings() {
  return useQuery({
    queryKey: focusQueryKeys.settings(),
    queryFn: focusService.getSettings,
  });
}
