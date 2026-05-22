export interface Note {
  id: string;
  title: string;
  content: string;
  tags?: string[];
  favorite?: boolean;
  isFavorite?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface CreateNotePayload {
  title: string;
  content: string;
  tags?: string[];
  isFavorite?: boolean;
}

export interface UpdateNotePayload {
  title?: string;
  content?: string;
  tags?: string[];
  isFavorite?: boolean;
}
