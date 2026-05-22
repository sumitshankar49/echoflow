import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';
import { Playlist } from './entities/playlist.entity';

@Injectable()
export class MusicService {
  constructor(
    @InjectRepository(Playlist)
    private readonly playlistsRepository: Repository<Playlist>,
  ) {}

  async create(
    createPlaylistDto: CreatePlaylistDto,
    currentUser: AuthenticatedUser,
  ): Promise<Playlist> {
    const playlist = this.playlistsRepository.create({
      name: createPlaylistDto.name,
      description: createPlaylistDto.description ?? null,
      tracks: createPlaylistDto.tracks?.map((track) => track.trim()).filter(Boolean) ?? null,
      userId: currentUser.userId,
    });

    return this.playlistsRepository.save(playlist);
  }

  async findAll(currentUser: AuthenticatedUser, pagination?: PaginationQueryDto): Promise<PaginatedResponseDto<Playlist>> {
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 20;
    const skip = (page - 1) * limit;

    const [data, total] = await this.playlistsRepository.findAndCount({
      where: { userId: currentUser.userId },
      order: { updatedAt: 'DESC' },
      skip,
      take: limit,
    });

    return new PaginatedResponseDto(data, total, page, limit);
  }

  async findOne(id: string, currentUser: AuthenticatedUser): Promise<Playlist> {
    const playlist = await this.playlistsRepository.findOne({
      where: {
        id,
        userId: currentUser.userId,
      },
    });

    if (!playlist) {
      throw new NotFoundException('Playlist not found');
    }

    return playlist;
  }

  async update(
    id: string,
    updatePlaylistDto: UpdatePlaylistDto,
    currentUser: AuthenticatedUser,
  ): Promise<Playlist> {
    const playlist = await this.playlistsRepository.findOne({ where: { id } });

    if (!playlist) {
      throw new NotFoundException('Playlist not found');
    }

    if (playlist.userId !== currentUser.userId) {
      throw new ForbiddenException('You do not have permission to update this playlist');
    }

    const updatedPlaylist = this.playlistsRepository.merge(playlist, {
      name: updatePlaylistDto.name ?? playlist.name,
      description: updatePlaylistDto.description !== undefined ? updatePlaylistDto.description : playlist.description,
      tracks: updatePlaylistDto.tracks !== undefined
        ? (updatePlaylistDto.tracks?.map((t) => t.trim()).filter(Boolean) ?? null)
        : playlist.tracks,
    });

    return this.playlistsRepository.save(updatedPlaylist);
  }

  async remove(id: string, currentUser: AuthenticatedUser): Promise<{ message: string }> {
    const playlist = await this.playlistsRepository.findOne({ where: { id } });

    if (!playlist) {
      throw new NotFoundException('Playlist not found');
    }

    if (playlist.userId !== currentUser.userId) {
      throw new ForbiddenException('You do not have permission to delete this playlist');
    }

    await this.playlistsRepository.remove(playlist);
    return { message: 'Playlist deleted successfully' };
  }
}