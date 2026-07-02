import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import {
  AuthenticatedUser,
  CurrentUser,
} from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CheckInDto } from './dto/check-in.dto';
import { CreateHabitDto } from './dto/create-habit.dto';
import { UpdateHabitDto } from './dto/update-habit.dto';
import { HabitLog, HabitWithStats } from './entities/habit.entity';
import { HabitsService } from './habits.service';

@ApiTags('Habits')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
@UseGuards(JwtAuthGuard)
@Controller('habits')
export class HabitsController {
  constructor(private readonly habitsService: HabitsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all habits with streak stats' })
  @ApiOkResponse({ type: HabitWithStats, isArray: true })
  findAll(@CurrentUser() user: AuthenticatedUser): Promise<HabitWithStats[]> {
    return this.habitsService.findAll(user);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new habit' })
  @ApiBody({ type: CreateHabitDto })
  @ApiCreatedResponse({ type: HabitWithStats })
  create(
    @Body() dto: CreateHabitDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<HabitWithStats> {
    return this.habitsService.create(dto, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a habit' })
  @ApiParam({ name: 'id', description: 'Habit UUID' })
  @ApiBody({ type: UpdateHabitDto })
  @ApiOkResponse({ type: HabitWithStats })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateHabitDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<HabitWithStats> {
    return this.habitsService.update(id, dto, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a habit' })
  @ApiParam({ name: 'id', description: 'Habit UUID' })
  @ApiOkResponse({ description: 'Habit deleted' })
  remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ message: string }> {
    return this.habitsService.remove(id, user);
  }

  @Get(':id/logs')
  @ApiOperation({ summary: 'Get all logs for a habit (for heatmap)' })
  @ApiParam({ name: 'id', description: 'Habit UUID' })
  @ApiOkResponse({ type: HabitLog, isArray: true })
  findLogs(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<HabitLog[]> {
    return this.habitsService.findLogs(id, user);
  }

  @Post(':id/check-in')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Check in today's habit" })
  @ApiParam({ name: 'id', description: 'Habit UUID' })
  @ApiBody({ type: CheckInDto })
  @ApiCreatedResponse({ description: 'Checked in successfully' })
  checkIn(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: CheckInDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.habitsService.checkIn(id, dto, user);
  }

  @Delete(':id/check-in')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Undo today's check-in" })
  @ApiParam({ name: 'id', description: 'Habit UUID' })
  @ApiOkResponse({ description: 'Check-in removed' })
  undoCheckIn(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ message: string }> {
    return this.habitsService.undoCheckIn(id, user);
  }
}
