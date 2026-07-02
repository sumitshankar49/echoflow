import { Controller, Get, Param, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
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
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { MemoryFilterDto } from './dto/memory-filter.dto';
import { Memory } from './entities/memory.entity';
import { MemoriesService } from './memories.service';

@ApiTags('Memories')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
@UseGuards(JwtAuthGuard)
@Controller('memories')
export class MemoriesController {
  constructor(private readonly memoriesService: MemoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Get paginated memories for the current user' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (max 100)', example: 20 })
  @ApiQuery({
    name: 'filter',
    required: false,
    description: 'Optional free-text filter (title, content, source type, tags)',
    example: 'journal productive',
  })
  @ApiOkResponse({
    description: 'Paginated memories',
    schema: { example: { data: [], total: 0, page: 1, totalPages: 0 } },
  })
  findAll(
    @Query() filter: MemoryFilterDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<PaginatedResponseDto<Memory>> {
    return this.memoriesService.findAll(currentUser, filter);
  }

  @Get('search')
  @ApiOperation({ summary: 'Smart contextual search over user memories' })
  @ApiQuery({ name: 'q', required: true, description: 'Search query text', example: 'meeting action items' })
  @ApiOkResponse({ description: 'Matching memories', type: Memory, isArray: true })
  search(
    @Query('q') query = '',
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<Memory[]> {
    return this.memoriesService.search(query, currentUser);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single memory by id for the current user' })
  @ApiParam({ name: 'id', description: 'Memory UUID' })
  @ApiOkResponse({ description: 'Memory fetched successfully', type: Memory })
  findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<Memory> {
    return this.memoriesService.findOne(id, currentUser);
  }
}
