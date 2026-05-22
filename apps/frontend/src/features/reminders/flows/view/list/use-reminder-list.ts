import { useQuery } from '@tanstack/react-query';
import { remindersService } from '../../../shared/data/reminders.service';
import { remindersQueryKeys } from '../../../shared/data/reminders.query-keys';
import type { ReminderFilters } from '../../../shared/domain/reminders.types';

export function useReminderList(filters?: ReminderFilters) {
  return useQuery({
    queryKey: [...remindersQueryKeys.list(), filters ?? {}],
    queryFn: () => remindersService.list(filters),
  });
}

