export type MemorySourceType = 'note' | 'journal' | 'task';

export interface Memory {
  id: string;
  title: string;
  content: string;
  sourceType: MemorySourceType;
  sourceId: string | null;
  tags: string[];
  importanceScore: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface MemoryListFilters {
  page?: number;
  limit?: number;
  filter?: string;
}
