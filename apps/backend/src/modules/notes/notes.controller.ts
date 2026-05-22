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
import { CreateNoteDto } from './dto/create-note.dto';
import { NoteFilterDto } from './dto/note-filter.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { Note } from './entities/note.entity';
import { NotesService } from './notes.service';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';

@ApiTags('Notes')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
@UseGuards(JwtAuthGuard)
@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all notes for current user' })
  @ApiQuery({ name: 'isFavorite', required: false, description: 'Filter by favourite status', example: true })
  @ApiQuery({ name: 'tag', required: false, description: 'Filter notes containing this tag', example: 'work' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (max 100)', example: 20 })
  @ApiOkResponse({
    description: 'Paginated notes',
    schema: { example: { data: [], total: 0, page: 1, totalPages: 0 } },
  })
  findAll(
    @Query() filter: NoteFilterDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<PaginatedResponseDto<Note>> {
    return this.notesService.findAll(currentUser, filter);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new note' })
  @ApiBody({ type: CreateNoteDto })
  @ApiCreatedResponse({ description: 'Note created successfully', type: Note })
  create(
    @Body() createNoteDto: CreateNoteDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<Note> {
    return this.notesService.create(createNoteDto, currentUser);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search notes by title or content' })
  @ApiQuery({
    name: 'q',
    required: false,
    description: 'Search query text',
    example: 'project',
  })
  @ApiOkResponse({ description: 'Matching notes fetched successfully', type: Note, isArray: true })
  search(
    @Query('q') query = '',
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<Note[]> {
    return this.notesService.search(query, currentUser);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single note by id' })
  @ApiParam({ name: 'id', description: 'Note UUID' })
  @ApiOkResponse({ description: 'Note fetched successfully', type: Note })
  findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<Note> {
    return this.notesService.findOne(id, currentUser);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing note by id' })
  @ApiParam({ name: 'id', description: 'Note UUID' })
  @ApiBody({ type: UpdateNoteDto })
  @ApiOkResponse({ description: 'Note updated successfully', type: Note })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateNoteDto: UpdateNoteDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<Note> {
    return this.notesService.update(id, updateNoteDto, currentUser);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a note by id' })
  @ApiParam({ name: 'id', description: 'Note UUID' })
  @ApiOkResponse({
    description: 'Note deleted successfully',
    schema: { example: { message: 'Note deleted successfully' } },
  })
  remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<{ message: string }> {
    return this.notesService.remove(id, currentUser);
  }
}
