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
import { CreateJournalDto } from './dto/create-journal.dto';
import { JournalFilterDto } from './dto/journal-filter.dto';
import { UpdateJournalDto } from './dto/update-journal.dto';
import { Journal } from './entities/journal.entity';
import { JournalService } from './journal.service';

@ApiTags('Journal')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
@UseGuards(JwtAuthGuard)
@Controller('journal')
export class JournalController {
  constructor(private readonly journalService: JournalService) {}

  @Get()
  @ApiOperation({ summary: 'Get journal entries for current user' })
  @ApiQuery({ name: 'date', required: false, description: 'Filter by date (YYYY-MM-DD)', example: '2026-05-29' })
  @ApiQuery({ name: 'mood', required: false, description: 'Filter by mood', example: 'calm' })
  @ApiOkResponse({ description: 'Journal entries fetched successfully', type: Journal, isArray: true })
  findAll(
    @Query() filter: JournalFilterDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<Journal[]> {
    return this.journalService.findAll(currentUser, filter);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new journal entry' })
  @ApiBody({ type: CreateJournalDto })
  @ApiCreatedResponse({ description: 'Journal entry created successfully', type: Journal })
  create(
    @Body() createJournalDto: CreateJournalDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<Journal> {
    return this.journalService.create(createJournalDto, currentUser);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a journal entry by id' })
  @ApiParam({ name: 'id', description: 'Journal entry UUID' })
  @ApiOkResponse({ description: 'Journal entry fetched successfully', type: Journal })
  findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<Journal> {
    return this.journalService.findOne(id, currentUser);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing journal entry by id' })
  @ApiParam({ name: 'id', description: 'Journal entry UUID' })
  @ApiBody({ type: UpdateJournalDto })
  @ApiOkResponse({ description: 'Journal entry updated successfully', type: Journal })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateJournalDto: UpdateJournalDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<Journal> {
    return this.journalService.update(id, updateJournalDto, currentUser);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a journal entry by id' })
  @ApiParam({ name: 'id', description: 'Journal entry UUID' })
  @ApiOkResponse({
    description: 'Journal entry deleted successfully',
    schema: { example: { message: 'Journal entry deleted successfully' } },
  })
  remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<{ message: string }> {
    return this.journalService.remove(id, currentUser);
  }
}
