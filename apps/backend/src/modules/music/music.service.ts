import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
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

  async findAll(currentUser: AuthenticatedUser): Promise<Playlist[]> {
    return this.playlistsRepository.find({
      where: { userId: currentUser.userId },
      order: { updatedAt: 'DESC' },
    });
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
}