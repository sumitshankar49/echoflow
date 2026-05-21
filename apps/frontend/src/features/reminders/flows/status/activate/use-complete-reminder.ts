import { useMutation, useQueryClient } from '@tanstack/react-query';
import { remindersService } from '../../shared/data/reminders.service';
import { remindersQueryKeys } from '../../shared/data/reminders.query-keys';

export function useCompleteReminder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => remindersService.update(id, { isCompleted: true }),
    onSuccess: () => qc.invalidateQueries({ queryKey: remindersQueryKeys.list() }),
  });
}
