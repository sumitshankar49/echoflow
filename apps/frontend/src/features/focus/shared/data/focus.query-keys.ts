export const focusQueryKeys = {
  all: ['focus'] as const,
  settings: () => [...focusQueryKeys.all, 'settings'] as const,
  sessions: () => [...focusQueryKeys.all, 'sessions'] as const,
};
