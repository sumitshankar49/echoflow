import { apiClient } from '@/shared/api/client';
import type {
  Circle,
  CircleApiResponse,
  CircleMember,
  CreateCirclePayload,
  InviteMemberResponse,
  InviteMemberPayload,
  PaginatedResponse,
} from '../domain/circles.types';

function normalizeMember(member: CircleMember): CircleMember {
  return {
    ...member,
    user: member.user
      ? {
          id: member.user.id,
          name: member.user.name,
          email: member.user.email,
        }
      : undefined,
  };
}

function normalizeCircle(circle: CircleApiResponse): Circle {
  return {
    id: circle.id,
    name: circle.name,
    description: circle.description ?? undefined,
    ownerId: circle.ownerId,
    createdAt: circle.createdAt,
    updatedAt: circle.updatedAt,
    members: Array.isArray(circle.members) ? circle.members.map(normalizeMember) : [],
  };
}

function extractCircles(payload: CircleApiResponse[] | PaginatedResponse<CircleApiResponse>): Circle[] {
  if (Array.isArray(payload)) {
    return payload.map(normalizeCircle);
  }

  if (payload && Array.isArray(payload.data)) {
    return payload.data.map(normalizeCircle);
  }

  return [];
}

export const circlesService = {
  list: () =>
    apiClient
      .get<CircleApiResponse[] | PaginatedResponse<CircleApiResponse>>('/circles')
      .then((r) => extractCircles(r.data)),
  get: (id: string) =>
    apiClient.get<CircleApiResponse>(`/circles/${id}`).then((r) => normalizeCircle(r.data)),
  create: (payload: CreateCirclePayload) =>
    apiClient.post<CircleApiResponse>('/circles', payload).then((r) => normalizeCircle(r.data)),
  invite: (id: string, payload: InviteMemberPayload) =>
    apiClient.post<InviteMemberResponse>(`/circles/${id}/invite`, payload).then((r) => r.data),
  acceptInvitation: (id: string) => apiClient.patch(`/circles/${id}/invitations/accept`).then((r) => r.data),
  declineInvitation: (id: string) => apiClient.patch(`/circles/${id}/invitations/decline`).then((r) => r.data),
  removeMember: (circleId: string, memberId: string) =>
    apiClient.delete(`/circles/${circleId}/members/${memberId}`).then((r) => r.data),
  leaveCircle: (id: string) => apiClient.post(`/circles/${id}/leave`).then((r) => r.data),
};
