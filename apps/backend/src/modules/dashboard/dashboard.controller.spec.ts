/// <reference types="jest" />

import { Test, TestingModule } from '@nestjs/testing';

import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

describe('DashboardController', () => {
  let controller: DashboardController;

  const dashboardServiceMock = {
    getOverview: jest.fn(),
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
      controllers: [DashboardController],
      providers: [
        {
          provide: DashboardService,
          useValue: dashboardServiceMock,
        },
      ],
    }).compile();

    controller = module.get<DashboardController>(DashboardController);
  });

  it('forwards getOverview to dashboard service', async () => {
    const response = {
      me: { name: 'Candy User' },
      summary: {
        notesCount: 2,
        pendingRemindersCount: 1,
        activeCirclesCount: 1,
        playlistsCount: 1,
      },
      recentNotes: [],
      upcomingReminders: [],
      activeCircles: [],
      quickPlayerPlaylist: null,
    };

    dashboardServiceMock.getOverview.mockResolvedValue(response);

    await expect(controller.getOverview(currentUser)).resolves.toEqual(response);
    expect(dashboardServiceMock.getOverview).toHaveBeenCalledWith(currentUser);
  });
});
