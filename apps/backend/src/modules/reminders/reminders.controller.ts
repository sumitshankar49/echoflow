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
import { CreateReminderDto } from './dto/create-reminder.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';
import { Reminder } from './entities/reminder.entity';
import { RemindersService } from './reminders.service';

@ApiTags('Reminders')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
@UseGuards(JwtAuthGuard)
@Controller('reminders')
export class RemindersController {
  constructor(private readonly remindersService: RemindersService) {}

  @Get()
  @ApiOperation({ summary: 'Get reminders for current user' })
  @ApiOkResponse({ description: 'Reminders fetched successfully', type: Reminder, isArray: true })
  findAll(@CurrentUser() currentUser: AuthenticatedUser): Promise<Reminder[]> {
    return this.remindersService.findAll(currentUser);
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