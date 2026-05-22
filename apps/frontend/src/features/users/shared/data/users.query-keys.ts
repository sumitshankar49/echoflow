export const usersQueryKeys = {
  all: ['users'] as const,
  me: () => [...usersQueryKeys.all, 'me'] as const,
};