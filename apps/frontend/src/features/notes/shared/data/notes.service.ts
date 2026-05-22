import { apiClient } from '@/shared/api/client';
import type {
  Note,
  CreateNotePayload,
  PaginatedResponse,
  UpdateNotePayload,
} from '../domain/notes.types';

function normalizeNote(note: Note): Note {
  return {
    ...note,
    tags: note.tags ?? [],
    favorite: note.favorite ?? note.isFavorite ?? false,
    isFavorite: note.isFavorite ?? note.favorite ?? false,
  };
}

function normalizeNotesPayload(payload: Note[] | PaginatedResponse<Note>): Note[] {
  if (Array.isArray(payload)) {
    return payload.map(normalizeNote);
  }

  if (payload && Array.isArray(payload.data)) {
    return payload.data.map(normalizeNote);
  }

  return [];
}

export const notesService = {
  list: () =>
    apiClient
      .get<Note[] | PaginatedResponse<Note>>('/notes')
      .then((r) => normalizeNotesPayload(r.data)),

  search: async (query: string) => {
    try {
      const response = await apiClient.get<Note[]>('/notes/search', {
        params: { q: query },
      });

      return response.data.map(normalizeNote);
    } catch {
      // Fallback to client-side search when backend search is unavailable.
      const allNotes = await notesService.list();
      const normalizedQuery = query.trim().toLowerCase();

      if (!normalizedQuery) {
        return allNotes;
      }

      return allNotes.filter((note) => {
        const haystack = `${note.title} ${note.content}`.toLowerCase();
        return haystack.includes(normalizedQuery);
      });
    }
  },

  get: (id: string) => apiClient.get<Note>(`/notes/${id}`).then((r) => normalizeNote(r.data)),
  create: (payload: CreateNotePayload) =>
    apiClient.post<Note>('/notes', payload).then((r) => normalizeNote(r.data)),
  update: (id: string, payload: UpdateNotePayload) =>
    apiClient.patch<Note>(`/notes/${id}`, payload).then((r) => normalizeNote(r.data)),
  remove: (id: string) => apiClient.delete(`/notes/${id}`).then((r) => r.data),
};
