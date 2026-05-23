export interface Playlist {
  id: string;
  name: string;
  description?: string;
  urls: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface PlaylistApiResponse {
  id: string;
  name: string;
  description?: string | null;
  urls?: string[] | null;
  tracks?: string[] | null;
  createdAt: string;
  updatedAt?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface CreatePlaylistPayload {
  name: string;
  description?: string;
  urls?: string[];
}

export interface UpdatePlaylistPayload {
  name?: string;
  description?: string;
  urls?: string[];
}
