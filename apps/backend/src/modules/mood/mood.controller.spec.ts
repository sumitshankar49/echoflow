/// <reference types="jest" />

import { Test, TestingModule } from '@nestjs/testing';

import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { MoodController } from './mood.controller';
import { MoodService } from './mood.service';

describe('MoodController', () => {
  let controller: MoodController;

  const moodServiceMock = {
    getTodayMood: jest.fn(),
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
      controllers: [MoodController],
      providers: [
        {
          provide: MoodService,
          useValue: moodServiceMock,
        },
      ],
    }).compile();

    controller = module.get<MoodController>(MoodController);
  });

  it('forwards getTodayMood to the mood service', async () => {
    const response = {
      currentMood: { mood: 'happy', recordedAt: new Date('2026-05-26T08:00:00.000Z') },
      trend: [],
    };
    moodServiceMock.getTodayMood.mockResolvedValue(response);

    await expect(controller.getTodayMood(currentUser)).resolves.toEqual(response);
    expect(moodServiceMock.getTodayMood).toHaveBeenCalledWith(currentUser);
  });
});