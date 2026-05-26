import { describe, expectTypeOf, it } from 'vitest';

import type {
  Circle,
  CircleApiResponse,
  CircleMember,
  CreateCirclePayload,
  InviteMemberPayload,
  InviteMemberResponse,
  PaginatedResponse,
  UpdateCirclePayload,
} from './circles.types';

describe('circles.types', () => {
  it('defines core circle and member shapes', () => {
    expectTypeOf<CircleMember>().toEqualTypeOf<{
      id: string;
      circleId: string;
      userId: string;
      role: 'owner' | 'member';
      status: 'invited' | 'accepted';
      createdAt?: string;
      updatedAt?: string;
      user?: {
        id: string;
        name: string;
        email: string;
      };
    }>();

    expectTypeOf<Circle>().toEqualTypeOf<{
      id: string;
      name: string;
      description?: string;
      ownerId: string;
      createdAt: string;
      updatedAt?: string;
      members?: CircleMember[];
    }>();
  });

  it('defines api and payload contracts', () => {
    expectTypeOf<CircleApiResponse>().toEqualTypeOf<{
      id: string;
      name: string;
      description?: string | null;
      ownerId: string;
      createdAt: string;
      updatedAt?: string;
      members?: CircleMember[];
    }>();

    expectTypeOf<CreateCirclePayload>().toEqualTypeOf<{
      name: string;
      description?: string;
    }>();

    expectTypeOf<UpdateCirclePayload>().toEqualTypeOf<{
      name?: string;
      description?: string;
    }>();

    expectTypeOf<InviteMemberPayload>().toEqualTypeOf<{
      email: string;
    }>();

    expectTypeOf<InviteMemberResponse>().toEqualTypeOf<{
      id?: string;
      message?: string;
    }>();
  });

  it('defines paginated response shape', () => {
    expectTypeOf<PaginatedResponse<CircleApiResponse>>().toEqualTypeOf<{
      data: CircleApiResponse[];
      total: number;
      page: number;
      totalPages: number;
    }>();
  });
});
