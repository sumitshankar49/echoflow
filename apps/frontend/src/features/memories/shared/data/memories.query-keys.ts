export const memoriesQueryKeys = {
  all: ['memories'] as const,
  list: (params?: { page?: number; limit?: number; filter?: string }) =>
    [...memoriesQueryKeys.all, 'list', params ?? {}] as const,
  search: (query: string) => [...memoriesQueryKeys.all, 'search', query] as const,
  detail: (id: string) => [...memoriesQueryKeys.all, 'detail', id] as const,
};
