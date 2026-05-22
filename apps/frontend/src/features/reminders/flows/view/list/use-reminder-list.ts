import { useQuery } from '@tanstack/react-query';
import { remindersService } from '../../../shared/data/reminders.service';
import { remindersQueryKeys } from '../../../shared/data/reminders.query-keys';

export function useReminderList() {
  return useQuery({
    queryKey: remindersQueryKeys.list(),
    queryFn: remindersService.list,
  });
}
