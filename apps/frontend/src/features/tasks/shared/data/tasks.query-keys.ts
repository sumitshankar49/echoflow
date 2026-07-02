export const tasksQueryKeys = {
  all: ['tasks'] as const,
  list: () => [...tasksQueryKeys.all, 'list'] as const,
  detail: (id: string) => [...tasksQueryKeys.all, 'detail', id] as const,
};