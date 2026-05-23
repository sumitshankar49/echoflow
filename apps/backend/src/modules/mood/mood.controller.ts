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
import { TodayMoodResponseDto } from './dto/today-mood-response.dto';
import { MoodService } from './mood.service';

@ApiTags('Mood')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
@UseGuards(JwtAuthGuard)
@Controller('mood')
export class MoodController {
  constructor(private readonly moodService: MoodService) {}

  @Get('today')
  @ApiOperation({ summary: "Get today's mood and 7-day trend" })
  @ApiOkResponse({
    description: "Today's mood and last 7-day mood trend",
    type: TodayMoodResponseDto,
  })
  getTodayMood(@CurrentUser() currentUser: AuthenticatedUser): Promise<TodayMoodResponseDto> {
    return this.moodService.getTodayMood(currentUser);
  }
}
