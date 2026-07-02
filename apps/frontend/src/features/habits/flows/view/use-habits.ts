import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { habitsQueryKeys } from '../../shared/data/habits.query-keys';
import { habitsService } from '../../shared/data/habits.service';
import type { HabitWithStats } from '../../shared/domain/habits.types';

export function useHabitList() {
  return useQuery({
    queryKey: habitsQueryKeys.list(),
    queryFn: habitsService.list,
  });
}

export function useHabitLogs(habitId: string, enabled = true) {
  return useQuery({
    queryKey: habitsQueryKeys.logs(habitId),
    queryFn: () => habitsService.getLogs(habitId),
    enabled,
  });
}

export function useCreateHabit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: habitsService.create,
    onSuccess: (newHabit) => {
      queryClient.setQueryData<HabitWithStats[]>(habitsQueryKeys.list(), (old = []) => [
        ...old,
        newHabit,
      ]);
    },
  });
}

export function useUpdateHabit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof habitsService.update>[1] }) =>
      habitsService.update(id, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData<HabitWithStats[]>(habitsQueryKeys.list(), (old = []) =>
        old.map((h) => (h.id === updated.id ? updated : h)),
      );
    },
  });
}

export function useDeleteHabit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: habitsService.remove,
    onSuccess: (_, habitId) => {
      queryClient.setQueryData<HabitWithStats[]>(habitsQueryKeys.list(), (old = []) =>
        old.filter((h) => h.id !== habitId),
      );
    },
  });
}

export function useCheckIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ habitId, note }: { habitId: string; note?: string }) =>
      habitsService.checkIn(habitId, note ? { note } : undefined),
    onSuccess: (_, { habitId }) => {
      queryClient.setQueryData<HabitWithStats[]>(habitsQueryKeys.list(), (old = []) =>
        old.map((h) =>
          h.id === habitId
            ? {
                ...h,
                completedToday: true,
                currentStreak: h.currentStreak + 1,
                totalCompletions: h.totalCompletions + 1,
              }
            : h,
        ),
      );
    },
  });
}

export function useUndoCheckIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: habitsService.undoCheckIn,
    onSuccess: (_, habitId) => {
      queryClient.setQueryData<HabitWithStats[]>(habitsQueryKeys.list(), (old = []) =>
        old.map((h) =>
          h.id === habitId
            ? {
                ...h,
                completedToday: false,
                currentStreak: Math.max(0, h.currentStreak - 1),
                totalCompletions: Math.max(0, h.totalCompletions - 1),
              }
            : h,
        ),
      );
    },
  });
}
