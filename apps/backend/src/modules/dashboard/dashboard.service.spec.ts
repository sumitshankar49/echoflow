/// <reference types="jest" />

import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import { DashboardService } from './dashboard.service';

describe('DashboardService', () => {
  let service: DashboardService;

  const prismaMock = {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    note: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    reminder: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    circle: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    circleMember: {
      findMany: jest.fn(),
    },
    playlist: {
      count: jest.fn(),
      findFirst: jest.fn(),
    },
  };

  const currentUser: AuthenticatedUser = {
    userId: 'user-id',
    email: 'candy@example.com',
    name: 'Candy User',
    tokenType: 'access',
  };

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  it('returns a normalized dashboard overview payload', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ name: 'Candy User' });
    prismaMock.note.count.mockResolvedValue(4);
    prismaMock.reminder.count.mockResolvedValue(2);
    prismaMock.playlist.count.mockResolvedValue(3);
    prismaMock.note.findMany.mockResolvedValue([
      {
        id: 'n-1',
        title: 'First note',
        content: 'Alpha',
        updatedAt: new Date('2026-05-26T10:00:00.000Z'),
      },
    ]);
    prismaMock.reminder.findMany.mockResolvedValue([
      {
        id: 'r-1',
        title: 'Standup',
        remindAt: new Date('2026-05-27T10:00:00.000Z'),
      },
    ]);
    prismaMock.circleMember.findMany
      .mockResolvedValueOnce([{ circleId: 'c-1' }])
      .mockResolvedValueOnce([
        {
          id: 'm-1',
          circleId: 'c-1',
          userId: 'member-1',
          role: 'member',
          status: 'accepted',
        },
      ]);
    prismaMock.circle.count.mockResolvedValue(1);
    prismaMock.circle.findMany.mockResolvedValue([{ id: 'c-1', name: 'Focus Team' }]);
    prismaMock.user.findMany.mockResolvedValue([
      {
        id: 'member-1',
        name: 'Buddy',
        email: 'buddy@example.com',
      },
    ]);
    prismaMock.playlist.findFirst.mockResolvedValue({
      id: 'p-1',
      name: 'Focus Mix',
      tracks: 'https://a, https://b',
    });

    await expect(service.getOverview(currentUser)).resolves.toEqual({
      me: { name: 'Candy User' },
      summary: {
        notesCount: 4,
        pendingRemindersCount: 2,
        activeCirclesCount: 1,
        playlistsCount: 3,
      },
      recentNotes: [
        {
          id: 'n-1',
          title: 'First note',
          content: 'Alpha',
          updatedAt: new Date('2026-05-26T10:00:00.000Z'),
        },
      ],
      upcomingReminders: [
        {
          id: 'r-1',
          title: 'Standup',
          remindAt: new Date('2026-05-27T10:00:00.000Z'),
        },
      ],
      activeCircles: [
        {
          id: 'c-1',
          name: 'Focus Team',
          members: [
            {
              id: 'm-1',
              circleId: 'c-1',
              userId: 'member-1',
              role: 'member',
              status: 'accepted',
              user: {
                id: 'member-1',
                name: 'Buddy',
                email: 'buddy@example.com',
              },
            },
          ],
        },
      ],
      quickPlayerPlaylist: {
        id: 'p-1',
        name: 'Focus Mix',
        urls: ['https://a', 'https://b'],
      },
    });
  });

  it('throws when user is no longer present', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.note.count.mockResolvedValue(0);
    prismaMock.reminder.count.mockResolvedValue(0);
    prismaMock.playlist.count.mockResolvedValue(0);
    prismaMock.note.findMany.mockResolvedValue([]);
    prismaMock.reminder.findMany.mockResolvedValue([]);
    prismaMock.circleMember.findMany.mockResolvedValue([]);
    prismaMock.playlist.findFirst.mockResolvedValue(null);

    await expect(service.getOverview(currentUser)).rejects.toThrow(
      new UnauthorizedException('User no longer exists'),
    );
  });
});
