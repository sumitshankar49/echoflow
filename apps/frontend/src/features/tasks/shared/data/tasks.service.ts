import { apiClient } from '@/shared/api/client';

import type { CreateTaskPayload, Task, UpdateTaskPayload } from '../domain/tasks.types';

function normalizeTask(task: Task): Task {
  return {
    ...task,
    tags: task.tags ?? [],
  };
}

export const tasksService = {
  list: async () => {
    const response = await apiClient.get<Task[]>('/tasks');
    return response.data.map(normalizeTask);
  },
  get: async (id: string) => {
    const response = await apiClient.get<Task>(`/tasks/${id}`);
    return normalizeTask(response.data);
  },
  create: async (payload: CreateTaskPayload) => {
    const response = await apiClient.post<Task>('/tasks', payload);
    return normalizeTask(response.data);
  },
  update: async (id: string, payload: UpdateTaskPayload) => {
    const response = await apiClient.patch<Task>(`/tasks/${id}`, payload);
    return normalizeTask(response.data);
  },
  remove: async (id: string) => {
    const response = await apiClient.delete<{ message: string }>(`/tasks/${id}`);
    return response.data;
  },
};