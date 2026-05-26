import { apiClient } from '@/shared/api/client';

import type { DashboardOverviewResponse } from '../types';

type DashboardOverviewApiResponse = {
  me: { name: string } | null;
  summary: {
    notesCount: number;
    pendingRemindersCount: number;
    activeCirclesCount: number;
    playlistsCount: number;
  };
  recentNotes: Array<{
    id: string;
    title: string;
    content: string;
    updatedAt: string | Date;
  }>;
  upcomingReminders: Array<{
    id: string;
    title: string;
    remindAt: string | Date;
  }>;
  activeCircles: Array<{
    id: string;
    name: string;
    members?: Array<{
      id: string;
      circleId: string;
      userId: string;
      role?: string;
      status?: string;
      user?: {
        id: string;
        name: string;
        email: string;
      };
    }>;
  }>;
  quickPlayerPlaylist: {
    id: string;
    name: string;
    urls?: string[] | null;
  } | null;
};

function normalizeOverviewResponse(payload: DashboardOverviewApiResponse): DashboardOverviewResponse {
  return {
    me: payload.me,
    summary: payload.summary,
    recentNotes: (payload.recentNotes ?? []).map((note) => ({
      ...note,
      updatedAt: String(note.updatedAt),
    })),
    upcomingReminders: (payload.upcomingReminders ?? []).map((reminder) => ({
      ...reminder,
      remindAt: String(reminder.remindAt),
    })),
    activeCircles: (payload.activeCircles ?? []).map((circle) => ({
      ...circle,
      members: (circle.members ?? []).map((member) => ({
        id: member.id,
        circleId: member.circleId,
        userId: member.userId,
        role: member.role === 'owner' ? 'owner' : 'member',
        status: member.status === 'accepted' ? 'accepted' : 'invited',
        user: member.user,
      })),
    })),
    quickPlayerPlaylist: payload.quickPlayerPlaylist
      ? {
          ...payload.quickPlayerPlaylist,
          urls: payload.quickPlayerPlaylist.urls ?? [],
        }
      : null,
  };
}

export const dashboardOverviewApi = {
  getOverview: () =>
    apiClient
      .get<DashboardOverviewApiResponse>('/dashboard/overview')
      .then((response) => normalizeOverviewResponse(response.data)),
};
