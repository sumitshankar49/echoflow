import { apiClient } from '@/shared/api';
import type { Reminder, CreateReminderPayload, UpdateReminderPayload } from '../domain/reminders.types';

export const remindersService = {
  list: () => apiClient.get<Reminder[]>('/reminders').then((r) => r.data),
  create: (payload: CreateReminderPayload) =>
    apiClient.post<Reminder>('/reminders', payload).then((r) => r.data),
  update: (id: string, payload: UpdateReminderPayload) =>
    apiClient.patch<Reminder>(`/reminders/${id}`, payload).then((r) => r.data),
  remove: (id: string) => apiClient.delete(`/reminders/${id}`).then((r) => r.data),
};
