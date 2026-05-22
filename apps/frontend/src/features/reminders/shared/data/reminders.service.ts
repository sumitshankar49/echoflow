import { apiClient } from '@/shared/api/client';
import type {
  Reminder,
  CreateReminderPayload,
  UpdateReminderPayload,
  PaginatedResponse,
  ReminderFilters,
} from '../domain/reminders.types';

function normalizeReminder(r: Reminder): Reminder {
  return {
    ...r,
    description: r.description ?? null,
  };
}

function extractReminders(payload: Reminder[] | PaginatedResponse<Reminder>): Reminder[] {
  if (Array.isArray(payload)) return payload.map(normalizeReminder);
  if (payload && Array.isArray(payload.data)) return payload.data.map(normalizeReminder);
  return [];
}

function extractPaginated(
  payload: Reminder[] | PaginatedResponse<Reminder>,
): PaginatedResponse<Reminder> {
  if (Array.isArray(payload)) {
    return { data: payload.map(normalizeReminder), total: payload.length, page: 1, totalPages: 1 };
  }
  return { ...payload, data: payload.data.map(normalizeReminder) };
}

export const remindersService = {
  list: (filters?: ReminderFilters) =>
    apiClient
      .get<Reminder[] | PaginatedResponse<Reminder>>('/reminders', { params: filters })
      .then((r) => extractPaginated(r.data)),

  listAll: (filters?: ReminderFilters) =>
    apiClient
      .get<Reminder[] | PaginatedResponse<Reminder>>('/reminders', { params: filters })
      .then((r) => extractReminders(r.data)),

  create: (payload: CreateReminderPayload) =>
    apiClient.post<Reminder>('/reminders', payload).then((r) => normalizeReminder(r.data)),

  update: (id: string, payload: UpdateReminderPayload) =>
    apiClient.patch<Reminder>(`/reminders/${id}`, payload).then((r) => normalizeReminder(r.data)),

  remove: (id: string) => apiClient.delete(`/reminders/${id}`).then((r) => r.data),
};

