import { apiClient } from '@/shared/api/client';
import type { Circle, CreateCirclePayload, InviteMemberPayload } from '../domain/circles.types';

export const circlesService = {
  list: () => apiClient.get<Circle[]>('/circles').then((r) => r.data),
  get: (id: string) => apiClient.get<Circle>(`/circles/${id}`).then((r) => r.data),
  create: (payload: CreateCirclePayload) =>
    apiClient.post<Circle>('/circles', payload).then((r) => r.data),
  invite: (id: string, payload: InviteMemberPayload) =>
    apiClient.post(`/circles/${id}/invite`, payload).then((r) => r.data),
};
