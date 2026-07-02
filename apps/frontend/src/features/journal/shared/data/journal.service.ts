import { apiClient } from '@/shared/api/client';
import type {
  CreateJournalPayload,
  JournalEntry,
  JournalFilters,
  UpdateJournalPayload,
} from '../domain/journal.types';

function normalizeEntry(entry: JournalEntry): JournalEntry {
  return {
    ...entry,
    tags: Array.isArray(entry.tags) ? entry.tags : [],
  };
}

export const journalService = {
  list: (filters?: JournalFilters) =>
    apiClient
      .get<JournalEntry[]>('/journal', { params: filters })
      .then((response) => response.data.map(normalizeEntry)),

  get: (id: string) =>
    apiClient.get<JournalEntry>(`/journal/${id}`).then((response) => normalizeEntry(response.data)),

  create: (payload: CreateJournalPayload) =>
    apiClient.post<JournalEntry>('/journal', payload).then((response) => normalizeEntry(response.data)),

  update: (id: string, payload: UpdateJournalPayload) =>
    apiClient.patch<JournalEntry>(`/journal/${id}`, payload).then((response) => normalizeEntry(response.data)),

  remove: (id: string) => apiClient.delete<{ message: string }>(`/journal/${id}`).then((response) => response.data),
};
