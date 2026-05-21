import { useMutation, useQueryClient } from '@tanstack/react-query';
import { remindersService } from '../../shared/data/reminders.service';
import { remindersQueryKeys } from '../../shared/data/reminders.query-keys';

export function useCreateReminder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: remindersService.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: remindersQueryKeys.list() }),
  });
}
