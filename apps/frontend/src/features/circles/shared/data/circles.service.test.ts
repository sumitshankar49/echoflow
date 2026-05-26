import { beforeEach, describe, expect, it, vi } from 'vitest';

import { circlesService } from './circles.service';
import { apiClient } from '@/shared/api/client';

vi.mock('@/shared/api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockedApiClient = vi.mocked(apiClient);

describe('circlesService', () => {
  beforeEach(() => {
    mockedApiClient.get.mockReset();
    mockedApiClient.post.mockReset();
    mockedApiClient.patch.mockReset();
    mockedApiClient.delete.mockReset();
  });

  it('normalizes list response from paginated payload', async () => {
    mockedApiClient.get.mockResolvedValue({
      data: {
        data: [
          {
            id: 'circle-1',
            name: 'Friends',
            description: null,
            ownerId: 'user-1',
            createdAt: '2026-05-26T00:00:00.000Z',
            updatedAt: '2026-05-26T00:00:00.000Z',
            members: [
              {
                id: 'member-1',
                circleId: 'circle-1',
                userId: 'user-1',
                role: 'owner',
                status: 'accepted',
                user: {
                  id: 'user-1',
                  name: 'Candy',
                  email: 'candy@example.com',
                },
              },
            ],
          },
        ],
        total: 1,
        page: 1,
        totalPages: 1,
      },
    });

    const result = await circlesService.list();

    expect(result).toEqual([
      {
        id: 'circle-1',
        name: 'Friends',
        description: undefined,
        ownerId: 'user-1',
        createdAt: '2026-05-26T00:00:00.000Z',
        updatedAt: '2026-05-26T00:00:00.000Z',
        members: [
          {
            id: 'member-1',
            circleId: 'circle-1',
            userId: 'user-1',
            role: 'owner',
            status: 'accepted',
            user: {
              id: 'user-1',
              name: 'Candy',
              email: 'candy@example.com',
            },
          },
        ],
      },
    ]);
    expect(mockedApiClient.get).toHaveBeenCalledWith('/circles');
  });

  it('sends update and remove requests to the right endpoints', async () => {
    mockedApiClient.patch.mockResolvedValue({
      data: {
        id: 'circle-1',
        name: 'Updated Friends',
        description: 'Updated',
        ownerId: 'user-1',
        createdAt: '2026-05-26T00:00:00.000Z',
        updatedAt: '2026-05-26T10:00:00.000Z',
        members: [],
      },
    });
    mockedApiClient.delete.mockResolvedValue({ data: { message: 'Circle deleted successfully' } });

    await expect(circlesService.update('circle-1', { name: 'Updated Friends' })).resolves.toEqual({
      id: 'circle-1',
      name: 'Updated Friends',
      description: 'Updated',
      ownerId: 'user-1',
      createdAt: '2026-05-26T00:00:00.000Z',
      updatedAt: '2026-05-26T10:00:00.000Z',
      members: [],
    });
    await expect(circlesService.remove('circle-1')).resolves.toEqual({ message: 'Circle deleted successfully' });

    expect(mockedApiClient.patch).toHaveBeenCalledWith('/circles/circle-1', { name: 'Updated Friends' });
    expect(mockedApiClient.delete).toHaveBeenCalledWith('/circles/circle-1');
  });

  it('normalizes list response from array payload and falls back to empty list', async () => {
    mockedApiClient.get
      .mockResolvedValueOnce({
        data: [
          {
            id: 'circle-2',
            name: 'Array Circle',
            description: 'Array payload',
            ownerId: 'user-2',
            createdAt: '2026-05-26T00:00:00.000Z',
            members: [],
          },
        ],
      })
      .mockResolvedValueOnce({ data: {} });

    await expect(circlesService.list()).resolves.toEqual([
      {
        id: 'circle-2',
        name: 'Array Circle',
        description: 'Array payload',
        ownerId: 'user-2',
        createdAt: '2026-05-26T00:00:00.000Z',
        updatedAt: undefined,
        members: [],
      },
    ]);

    await expect(circlesService.list()).resolves.toEqual([]);
  });

  it('sends get/create/invite/accept/decline/removeMember/leave requests', async () => {
    const circle = {
      id: 'circle-3',
      name: 'Created Circle',
      description: null,
      ownerId: 'user-3',
      createdAt: '2026-05-26T00:00:00.000Z',
      members: [],
    };

    mockedApiClient.get.mockResolvedValue({ data: circle });
    mockedApiClient.post
      .mockResolvedValueOnce({ data: circle })
      .mockResolvedValueOnce({ data: { id: 'invite-1', message: 'Invitation sent' } })
      .mockResolvedValueOnce({ data: { message: 'Left circle' } });
    mockedApiClient.patch
      .mockResolvedValueOnce({ data: { message: 'Invitation accepted' } })
      .mockResolvedValueOnce({ data: { message: 'Invitation declined' } });
    mockedApiClient.delete.mockResolvedValue({ data: { message: 'Removed member' } });

    await expect(circlesService.get('circle-3')).resolves.toEqual({
      ...circle,
      description: undefined,
      updatedAt: undefined,
    });
    await expect(circlesService.create({ name: 'Created Circle' })).resolves.toEqual({
      ...circle,
      description: undefined,
      updatedAt: undefined,
    });
    await expect(circlesService.invite('circle-3', { email: 'invitee@example.com' })).resolves.toEqual({
      id: 'invite-1',
      message: 'Invitation sent',
    });
    await expect(circlesService.acceptInvitation('circle-3')).resolves.toEqual({
      message: 'Invitation accepted',
    });
    await expect(circlesService.declineInvitation('circle-3')).resolves.toEqual({
      message: 'Invitation declined',
    });
    await expect(circlesService.removeMember('circle-3', 'member-1')).resolves.toEqual({
      message: 'Removed member',
    });
    await expect(circlesService.leaveCircle('circle-3')).resolves.toEqual({
      message: 'Left circle',
    });

    expect(mockedApiClient.get).toHaveBeenCalledWith('/circles/circle-3');
    expect(mockedApiClient.post).toHaveBeenCalledWith('/circles', { name: 'Created Circle' });
    expect(mockedApiClient.post).toHaveBeenCalledWith('/circles/circle-3/invite', {
      email: 'invitee@example.com',
    });
    expect(mockedApiClient.patch).toHaveBeenCalledWith('/circles/circle-3/invitations/accept');
    expect(mockedApiClient.patch).toHaveBeenCalledWith('/circles/circle-3/invitations/decline');
    expect(mockedApiClient.delete).toHaveBeenCalledWith('/circles/circle-3/members/member-1');
    expect(mockedApiClient.post).toHaveBeenCalledWith('/circles/circle-3/leave');
  });

  it('normalizes missing nested fields safely', async () => {
    mockedApiClient.get
      .mockResolvedValueOnce({
        data: {
          id: 'circle-4',
          name: 'No Members Circle',
          description: null,
          ownerId: 'user-4',
          createdAt: '2026-05-26T00:00:00.000Z',
        },
      })
      .mockResolvedValueOnce({
        data: [
          {
            id: 'circle-5',
            name: 'Loose Member Circle',
            ownerId: 'user-5',
            createdAt: '2026-05-26T00:00:00.000Z',
            members: [
              {
                id: 'member-5',
                circleId: 'circle-5',
                userId: 'user-5',
                role: 'member',
                status: 'accepted',
              },
            ],
          },
        ],
      });

    await expect(circlesService.get('circle-4')).resolves.toEqual({
      id: 'circle-4',
      name: 'No Members Circle',
      description: undefined,
      ownerId: 'user-4',
      createdAt: '2026-05-26T00:00:00.000Z',
      updatedAt: undefined,
      members: [],
    });

    await expect(circlesService.list()).resolves.toEqual([
      {
        id: 'circle-5',
        name: 'Loose Member Circle',
        description: undefined,
        ownerId: 'user-5',
        createdAt: '2026-05-26T00:00:00.000Z',
        updatedAt: undefined,
        members: [
          {
            id: 'member-5',
            circleId: 'circle-5',
            userId: 'user-5',
            role: 'member',
            status: 'accepted',
            user: undefined,
          },
        ],
      },
    ]);
  });
});
