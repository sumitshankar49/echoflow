import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
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
import { CreateFocusSessionDto } from './dto/create-focus-session.dto';
import { UpdateFocusSettingsDto } from './dto/update-focus-settings.dto';
import { FocusSession } from './entities/focus-session.entity';
import { FocusSettings } from './entities/focus-settings.entity';
import { FocusService } from './focus.service';

@ApiTags('Focus')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
@UseGuards(JwtAuthGuard)
@Controller('focus')
export class FocusController {
  constructor(private readonly focusService: FocusService) {}

  @Get('settings')
  @ApiOperation({ summary: 'Get focus settings for current user' })
  @ApiOkResponse({ description: 'Focus settings fetched successfully', type: FocusSettings })
  getSettings(@CurrentUser() currentUser: AuthenticatedUser): Promise<FocusSettings> {
    return this.focusService.getSettings(currentUser);
  }

  @Patch('settings')
  @ApiOperation({ summary: 'Update focus settings for current user' })
  @ApiBody({ type: UpdateFocusSettingsDto })
  @ApiOkResponse({ description: 'Focus settings updated successfully', type: FocusSettings })
  updateSettings(
    @Body() dto: UpdateFocusSettingsDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<FocusSettings> {
    return this.focusService.updateSettings(dto, currentUser);
  }

  @Post('session')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Record a completed focus session' })
  @ApiBody({ type: CreateFocusSessionDto })
  @ApiCreatedResponse({ description: 'Focus session recorded successfully', type: FocusSession })
  createSession(
    @Body() dto: CreateFocusSessionDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<FocusSession> {
    return this.focusService.createSession(dto, currentUser);
  }
}
