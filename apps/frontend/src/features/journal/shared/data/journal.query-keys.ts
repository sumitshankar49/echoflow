import type { JournalFilters } from '../domain/journal.types';

export const journalQueryKeys = {
  all: ['journal'] as const,
  list: (filters?: JournalFilters) => [...journalQueryKeys.all, 'list', filters ?? {}] as const,
  detail: (id: string) => [...journalQueryKeys.all, 'detail', id] as const,
};
