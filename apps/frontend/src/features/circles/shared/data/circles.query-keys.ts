export const circlesQueryKeys = {
  all: ['circles'] as const,
  list: () => [...circlesQueryKeys.all, 'list'] as const,
  detail: (id: string) => [...circlesQueryKeys.all, 'detail', id] as const,
  sharedNotes: (id: string) => [...circlesQueryKeys.all, 'shared-notes', id] as const,
};
