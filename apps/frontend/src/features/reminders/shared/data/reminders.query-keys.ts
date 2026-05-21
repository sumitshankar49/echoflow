export const remindersQueryKeys = {
  all: ['reminders'] as const,
  list: () => [...remindersQueryKeys.all, 'list'] as const,
  detail: (id: string) => [...remindersQueryKeys.all, 'detail', id] as const,
};
