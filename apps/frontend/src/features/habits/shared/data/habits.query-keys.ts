export const habitsQueryKeys = {
  all: ['habits'] as const,
  list: () => [...habitsQueryKeys.all, 'list'] as const,
  logs: (habitId: string) => [...habitsQueryKeys.all, 'logs', habitId] as const,
};
