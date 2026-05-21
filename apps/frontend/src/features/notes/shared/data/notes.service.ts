import { apiClient } from '@/shared/api';
import type { Note, CreateNotePayload, UpdateNotePayload } from '../domain/notes.types';

export const notesService = {
  list: () => apiClient.get<Note[]>('/notes').then((r) => r.data),
  get: (id: string) => apiClient.get<Note>(`/notes/${id}`).then((r) => r.data),
  create: (payload: CreateNotePayload) =>
    apiClient.post<Note>('/notes', payload).then((r) => r.data),
  update: (id: string, payload: UpdateNotePayload) =>
    apiClient.patch<Note>(`/notes/${id}`, payload).then((r) => r.data),
  remove: (id: string) => apiClient.delete(`/notes/${id}`).then((r) => r.data),
};
