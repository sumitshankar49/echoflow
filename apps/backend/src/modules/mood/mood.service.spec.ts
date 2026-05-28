/// <reference types="jest" />

import { Test, TestingModule } from '@nestjs/testing';

import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import { MoodService } from './mood.service';

describe('MoodService', () => {
  let service: MoodService;
  const fixedNow = new Date('2026-05-26T12:00:00.000Z');

  const prismaMock = {
    mood: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
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
    jest.useFakeTimers();
    jest.setSystemTime(fixedNow);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoodService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<MoodService>(MoodService);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns current mood and a 7-day trend', async () => {
    prismaMock.mood.findFirst.mockResolvedValue({
      mood: 'happy',
      recordedAt: new Date('2026-05-26T08:00:00.000Z'),
    });
    prismaMock.mood.findMany.mockResolvedValue([
      { mood: 'happy', recordedAt: new Date('2026-05-26T08:00:00.000Z') },
      { mood: 'calm', recordedAt: new Date('2026-05-25T08:00:00.000Z') },
    ]);

    const result = await service.getTodayMood(currentUser);

    expect(result.currentMood.mood).toBe('happy');
    expect(result.trend).toHaveLength(7);
    expect(result.trend[result.trend.length - 1].mood).toBe('happy');
  });

  it('returns null mood values when there are no records', async () => {
    prismaMock.mood.findFirst.mockResolvedValue(null);
    prismaMock.mood.findMany.mockResolvedValue([]);

    const result = await service.getTodayMood(currentUser);

    expect(result.currentMood).toEqual({ mood: null, recordedAt: null });
    expect(result.trend).toHaveLength(7);
    expect(result.trend.every((point) => point.mood === null)).toBe(true);
  });
});