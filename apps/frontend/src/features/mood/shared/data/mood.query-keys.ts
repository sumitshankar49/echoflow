export const moodQueryKeys = {
  all: ['mood'] as const,
  today: () => [...moodQueryKeys.all, 'today'] as const,
};
