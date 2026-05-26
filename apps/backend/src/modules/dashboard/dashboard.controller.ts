import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import {
  AuthenticatedUser,
  CurrentUser,
} from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { DashboardOverviewResponse } from './entities/dashboard-overview.entity';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Get dashboard overview for current user' })
  @ApiOkResponse({
    description: 'Dashboard overview payload',
    schema: {
      example: {
        me: { name: 'Candy User' },
        summary: {
          notesCount: 12,
          pendingRemindersCount: 5,
          activeCirclesCount: 3,
          playlistsCount: 2,
        },
        recentNotes: [{ id: 'note-id', title: 'Sprint notes', content: '...', updatedAt: '2026-05-26T10:30:00.000Z' }],
        upcomingReminders: [{ id: 'reminder-id', title: 'Team sync', remindAt: '2026-05-26T18:00:00.000Z' }],
        activeCircles: [{ id: 'circle-id', name: 'Product Team', members: [] }],
        quickPlayerPlaylist: {
          id: 'playlist-id',
          name: 'Focus Mix',
          urls: ['https://www.youtube.com/watch?v=abc'],
        },
      },
    },
  })
  getOverview(@CurrentUser() currentUser: AuthenticatedUser): Promise<DashboardOverviewResponse> {
    return this.dashboardService.getOverview(currentUser);
  }
}
