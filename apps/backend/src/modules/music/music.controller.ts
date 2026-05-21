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
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';
import { Playlist } from './entities/playlist.entity';
import { MusicService } from './music.service';

@ApiTags('Music')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
@UseGuards(JwtAuthGuard)
@Controller('music/playlists')
export class MusicController {
  constructor(private readonly musicService: MusicService) {}

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

  @Get()
  @ApiOperation({ summary: 'Get playlists for current user' })
  @ApiOkResponse({ description: 'Playlists fetched successfully', type: Playlist, isArray: true })
  findAll(@CurrentUser() currentUser: AuthenticatedUser): Promise<Playlist[]> {
    return this.musicService.findAll(currentUser);
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
