export interface Circle {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  createdAt: string;
}

export interface CircleMember {
  id: string;
  circleId: string;
  userId: string;
  role: 'owner' | 'member';
  status: 'invited' | 'accepted';
}

export interface CreateCirclePayload {
  name: string;
  description?: string;
}

export interface InviteMemberPayload {
  email: string;
}
