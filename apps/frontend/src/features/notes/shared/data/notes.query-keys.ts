export const notesQueryKeys = {
  all: ['notes'] as const,
  list: () => [...notesQueryKeys.all, 'list'] as const,
  search: (query: string) => [...notesQueryKeys.all, 'search', query] as const,
  detail: (id: string) => [...notesQueryKeys.all, 'detail', id] as const,
};
