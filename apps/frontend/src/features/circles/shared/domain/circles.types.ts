export interface Circle {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  createdAt: string;
  updatedAt?: string;
  members?: CircleMember[];
}

export interface CircleMember {
  id: string;
  circleId: string;
  userId: string;
  role: 'owner' | 'member';
  status: 'invited' | 'accepted';
  createdAt?: string;
  updatedAt?: string;
  user?: CircleMemberUser;
}

interface CircleMemberUser {
  id: string;
  name: string;
  email: string;
}

export interface CircleApiResponse {
  id: string;
  name: string;
  description?: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt?: string;
  members?: CircleMember[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface CreateCirclePayload {
  name: string;
  description?: string;
}

export interface UpdateCirclePayload {
  name?: string;
  description?: string;
}

export interface InviteMemberPayload {
  email: string;
}

export interface InviteMemberResponse {
  id?: string;
  message?: string;
}

export interface CircleSharedNote {
  id: string;
  circleId: string;
  noteId: string;
  sharedByUserId: string;
  createdAt: string;
  note: {
    id: string;
    title: string;
    content: string;
    tags?: string[] | null;
    isFavorite: boolean;
    userId: string;
    createdAt: string;
    updatedAt: string;
  };
  sharedBy?: CircleMemberUser;
}

export interface ShareCircleNotePayload {
  noteId: string;
}
