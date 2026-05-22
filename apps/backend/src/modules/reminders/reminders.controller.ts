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
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import {
  AuthenticatedUser,
  CurrentUser,
} from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { ReminderFilterDto } from './dto/reminder-filter.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';
import { Reminder } from './entities/reminder.entity';
import { RemindersService } from './reminders.service';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';

@ApiTags('Reminders')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
@UseGuards(JwtAuthGuard)
@Controller('reminders')
export class RemindersController {
  constructor(private readonly remindersService: RemindersService) {}

  @Get()
  @ApiOperation({ summary: 'Get reminders for current user' })
  @ApiQuery({ name: 'isCompleted', required: false, description: 'Filter by completion status', example: false })
  @ApiQuery({ name: 'from', required: false, description: 'Filter reminders from this date (inclusive)', example: '2026-05-01' })
  @ApiQuery({ name: 'to', required: false, description: 'Filter reminders up to this date (inclusive)', example: '2026-05-31' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (max 100)', example: 20 })
  @ApiOkResponse({
    description: 'Paginated reminders',
    schema: { example: { data: [], total: 0, page: 1, totalPages: 0 } },
  })
  findAll(
    @Query() filter: ReminderFilterDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<PaginatedResponseDto<Reminder>> {
    return this.remindersService.findAll(currentUser, filter);
  }

  @Post()
  @ApiOperation({ summary: 'Create reminder' })
  @ApiBody({ type: CreateReminderDto })
  @ApiCreatedResponse({ description: 'Reminder created successfully', type: Reminder })
  create(
    @Body() createReminderDto: CreateReminderDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<Reminder> {
    return this.remindersService.create(createReminderDto, currentUser);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single reminder by id' })
  @ApiParam({ name: 'id', description: 'Reminder UUID' })
  @ApiOkResponse({ description: 'Reminder fetched successfully', type: Reminder })
  findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<Reminder> {
    return this.remindersService.findOne(id, currentUser);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update reminder by id' })
  @ApiParam({ name: 'id', description: 'Reminder UUID' })
  @ApiBody({ type: UpdateReminderDto })
  @ApiOkResponse({ description: 'Reminder updated successfully', type: Reminder })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateReminderDto: UpdateReminderDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<Reminder> {
    return this.remindersService.update(id, updateReminderDto, currentUser);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete reminder by id' })
  @ApiParam({ name: 'id', description: 'Reminder UUID' })
  @ApiOkResponse({
    description: 'Reminder deleted successfully',
    schema: { example: { message: 'Reminder deleted successfully' } },
  })
  remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<{ message: string }> {
    return this.remindersService.remove(id, currentUser);
  }
}