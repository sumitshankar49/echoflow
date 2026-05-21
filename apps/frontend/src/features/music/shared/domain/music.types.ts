export interface Playlist {
  id: string;
  name: string;
  description?: string;
  urls: string[];
  createdAt: string;
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
