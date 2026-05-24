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
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';
import { Playlist } from './entities/playlist.entity';
import { MusicService } from './music.service';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@ApiTags('Music')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
@UseGuards(JwtAuthGuard)
@Controller('music/playlists')
export class MusicController {
  constructor(private readonly musicService: MusicService) {}

  @Get()
  @ApiOperation({ summary: 'Get playlists for current user' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (max 100)', example: 20 })
  @ApiOkResponse({
    description: 'Paginated playlists',
    schema: { example: { data: [], total: 0, page: 1, totalPages: 0 } },
  })
  findAll(
    @Query() pagination: PaginationQueryDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<PaginatedResponseDto<Playlist>> {
    return this.musicService.findAll(currentUser, pagination);
  }

  @Post()
  @ApiOperation({ summary: 'Create playlist' })
  @ApiBody({ type: CreatePlaylistDto })
  @ApiCreatedResponse({ description: 'Playlist created successfully', type: Playlist })
  create(
    @Body() createPlaylistDto: CreatePlaylistDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<Playlist> {
    return this.musicService.create(createPlaylistDto, currentUser);
  }

  @Get('link-metadata')
  @ApiOperation({ summary: 'Resolve external music link metadata' })
  @ApiQuery({ name: 'url', required: true, description: 'Track or playlist URL' })
  @ApiOkResponse({
    description: 'Resolved metadata',
    schema: {
      example: {
        title: 'Top Songs Playlist',
        artist: 'Spotify',
        thumbnailUrl: 'https://i.scdn.co/image/abcd',
      },
    },
  })
  resolveLinkMetadata(
    @Query('url') url: string,
    @CurrentUser() _currentUser: AuthenticatedUser,
  ): Promise<{ title?: string; artist?: string; thumbnailUrl?: string }> {
    return this.musicService.resolveLinkMetadata(url);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get playlist by id' })
  @ApiParam({ name: 'id', description: 'Playlist UUID' })
  @ApiOkResponse({ description: 'Playlist fetched successfully', type: Playlist })
  findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<Playlist> {
    return this.musicService.findOne(id, currentUser);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update playlist by id' })
  @ApiParam({ name: 'id', description: 'Playlist UUID' })
  @ApiBody({ type: UpdatePlaylistDto })
  @ApiOkResponse({ description: 'Playlist updated successfully', type: Playlist })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updatePlaylistDto: UpdatePlaylistDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<Playlist> {
    return this.musicService.update(id, updatePlaylistDto, currentUser);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete playlist by id' })
  @ApiParam({ name: 'id', description: 'Playlist UUID' })
  @ApiOkResponse({
    description: 'Playlist deleted successfully',
    schema: { example: { message: 'Playlist deleted successfully' } },
  })
  remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<{ message: string }> {
    return this.musicService.remove(id, currentUser);
  }
}