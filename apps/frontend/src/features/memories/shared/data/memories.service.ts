import { apiClient } from '@/shared/api/client';
import type {
  Memory,
  MemoryListFilters,
  PaginatedResponse,
} from '../domain/memories.types';

function normalizeMemory(memory: Memory): Memory {
  return {
    ...memory,
    tags: Array.isArray(memory.tags) ? memory.tags : [],
    sourceId: memory.sourceId ?? null,
  };
}

function normalizePaginated(
  payload: Memory[] | PaginatedResponse<Memory>,
): PaginatedResponse<Memory> {
  if (Array.isArray(payload)) {
    return {
      data: payload.map(normalizeMemory),
      total: payload.length,
      page: 1,
      totalPages: 1,
    };
  }

  return {
    ...payload,
    data: payload.data.map(normalizeMemory),
  };
}

export const memoriesService = {
  list: async (params?: MemoryListFilters) => {
    try {
      const response = await apiClient.get<Memory[] | PaginatedResponse<Memory>>('/memories', {
        params,
      });
      return normalizePaginated(response.data);
    } catch {
      // Keep the memories page usable even if backend table/migration is not ready yet.
      return {
        data: [],
        total: 0,
        page: params?.page ?? 1,
        totalPages: 0,
      } satisfies PaginatedResponse<Memory>;
    }
  },

  search: async (query: string) => {
    const normalizedQuery = query.trim();

    if (!normalizedQuery) {
      const payload = await memoriesService.list({ page: 1, limit: 100 });
      return payload.data;
    }

    try {
      const response = await apiClient.get<Memory[]>('/memories/search', {
        params: { q: normalizedQuery },
      });

      return response.data.map(normalizeMemory);
    } catch {
      // Fallback to local search when endpoint is temporarily unavailable.
      const payload = await memoriesService.list({ page: 1, limit: 100 });
      const lowered = normalizedQuery.toLowerCase();

      return payload.data.filter((memory) => {
        const haystack = `${memory.title} ${memory.content} ${(memory.tags ?? []).join(' ')}`.toLowerCase();
        return haystack.includes(lowered);
      });
    }
  },

  get: async (id: string) => {
    try {
      const response = await apiClient.get<Memory>(`/memories/${id}`);
      return normalizeMemory(response.data);
    } catch {
      return {
        id,
        title: 'Memory unavailable',
        content: '',
        sourceType: 'note',
        sourceId: null,
        tags: [],
        importanceScore: 0,
        userId: '',
        createdAt: new Date(0).toISOString(),
        updatedAt: new Date(0).toISOString(),
      } satisfies Memory;
    }
  },
};
