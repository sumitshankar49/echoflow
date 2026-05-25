import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';
import { Playlist } from './entities/playlist.entity';

@Injectable()
export class MusicService {
  constructor(private readonly prisma: PrismaService) {}

  private mapTracksToDb(tracks: string[] | undefined): string | null | undefined {
    if (tracks === undefined) {
      return undefined;
    }

    const normalized = tracks.map((track) => track.trim()).filter(Boolean);
    return normalized.length > 0 ? normalized.join(',') : null;
  }

  private mapTracksFromDb(tracks: string | null): string[] | null {
    if (!tracks) {
      return null;
    }

    const parsed = tracks.split(',').map((track) => track.trim()).filter(Boolean);
    return parsed.length > 0 ? parsed : null;
  }

  private toPlaylistEntity(record: {
    id: string;
    name: string;
    description: string | null;
    tracks: string | null;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
  }): Playlist {
    return {
      ...record,
      tracks: this.mapTracksFromDb(record.tracks),
    };
  }

  async create(
    createPlaylistDto: CreatePlaylistDto,
    currentUser: AuthenticatedUser,
  ): Promise<Playlist> {
    const playlist = await this.prisma.playlist.create({
      data: {
        name: createPlaylistDto.name,
        description: createPlaylistDto.description ?? null,
        tracks: this.mapTracksToDb(createPlaylistDto.tracks) ?? null,
        userId: currentUser.userId,
      },
    });

    return this.toPlaylistEntity(playlist);
  }

  async findAll(currentUser: AuthenticatedUser, pagination?: PaginationQueryDto): Promise<PaginatedResponseDto<Playlist>> {
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 20;
    const skip = (page - 1) * limit;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.playlist.findMany({
        where: { userId: currentUser.userId },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.playlist.count({ where: { userId: currentUser.userId } }),
    ]);

    return new PaginatedResponseDto(data.map((item) => this.toPlaylistEntity(item)), total, page, limit);
  }

  async findOne(id: string, currentUser: AuthenticatedUser): Promise<Playlist> {
    const playlist = await this.prisma.playlist.findFirst({
      where: { id, userId: currentUser.userId },
    });

    if (!playlist) {
      throw new NotFoundException('Playlist not found');
    }

    return this.toPlaylistEntity(playlist);
  }

  async update(
    id: string,
    updatePlaylistDto: UpdatePlaylistDto,
    currentUser: AuthenticatedUser,
  ): Promise<Playlist> {
    const playlist = await this.prisma.playlist.findUnique({ where: { id } });

    if (!playlist) {
      throw new NotFoundException('Playlist not found');
    }

    if (playlist.userId !== currentUser.userId) {
      throw new ForbiddenException('You do not have permission to update this playlist');
    }

    const updatedPlaylist = await this.prisma.playlist.update({
      where: { id },
      data: {
        ...(updatePlaylistDto.name !== undefined ? { name: updatePlaylistDto.name } : {}),
        ...(updatePlaylistDto.description !== undefined
          ? { description: updatePlaylistDto.description }
          : {}),
        ...(updatePlaylistDto.tracks !== undefined
          ? { tracks: this.mapTracksToDb(updatePlaylistDto.tracks) }
          : {}),
      },
    });

    return this.toPlaylistEntity(updatedPlaylist);
  }

  async remove(id: string, currentUser: AuthenticatedUser): Promise<{ message: string }> {
    const playlist = await this.prisma.playlist.findUnique({ where: { id } });

    if (!playlist) {
      throw new NotFoundException('Playlist not found');
    }

    if (playlist.userId !== currentUser.userId) {
      throw new ForbiddenException('You do not have permission to delete this playlist');
    }

    await this.prisma.playlist.delete({ where: { id } });
    return { message: 'Playlist deleted successfully' };
  }

  async resolveLinkMetadata(url: string): Promise<{
    title?: string;
    artist?: string;
    thumbnailUrl?: string;
  }> {
    const trimmed = url?.trim();

    if (!trimmed) {
      throw new BadRequestException('url is required');
    }

    let parsed: URL;
    try {
      parsed = new URL(trimmed);
    } catch {
      throw new BadRequestException('Invalid URL');
    }

    const host = parsed.hostname.replace(/^www\./, '').toLowerCase();
    const encodedUrl = encodeURIComponent(trimmed);

    if (host.includes('spotify.com')) {
      const response = await fetch(`https://open.spotify.com/oembed?url=${encodedUrl}`);
      if (!response.ok) {
        return {};
      }

      const payload = (await response.json()) as {
        title?: string;
        thumbnail_url?: string;
      };

      const titleRaw = payload.title?.trim();
      if (!titleRaw) {
        return {};
      }

      const byIndex = titleRaw.toLowerCase().lastIndexOf(' by ');
      if (byIndex > 0) {
        return {
          title: titleRaw.slice(0, byIndex).trim(),
          artist: titleRaw.slice(byIndex + 4).trim(),
          thumbnailUrl: payload.thumbnail_url,
        };
      }

      return {
        title: titleRaw,
        thumbnailUrl: payload.thumbnail_url,
      };
    }

    if (host.includes('youtube.com') || host.includes('youtu.be')) {
      const response = await fetch(`https://www.youtube.com/oembed?url=${encodedUrl}&format=json`);
      if (!response.ok) {
        return {};
      }

      const payload = (await response.json()) as {
        title?: string;
        author_name?: string;
        thumbnail_url?: string;
      };

      return {
        title: payload.title?.trim(),
        artist: payload.author_name?.trim(),
        thumbnailUrl: payload.thumbnail_url,
      };
    }

    if (host.includes('soundcloud.com')) {
      const response = await fetch(`https://soundcloud.com/oembed?format=json&url=${encodedUrl}`);
      if (!response.ok) {
        return {};
      }

      const payload = (await response.json()) as {
        title?: string;
        author_name?: string;
        thumbnail_url?: string;
      };

      const titleRaw = payload.title?.trim();
      if (!titleRaw) {
        return {
          artist: payload.author_name?.trim(),
          thumbnailUrl: payload.thumbnail_url,
        };
      }

      const separatorIndex = titleRaw.indexOf(' - ');
      if (separatorIndex > 0) {
        return {
          artist: titleRaw.slice(0, separatorIndex).trim(),
          title: titleRaw.slice(separatorIndex + 3).trim(),
          thumbnailUrl: payload.thumbnail_url,
        };
      }

      return {
        title: titleRaw,
        artist: payload.author_name?.trim(),
        thumbnailUrl: payload.thumbnail_url,
      };
    }

    return {};
  }

  async resolveYouTubePlaylistTracks(url: string): Promise<{ tracks: string[] }> {
    const trimmed = url?.trim();

    if (!trimmed) {
      throw new BadRequestException('url is required');
    }

    let parsed: URL;
    try {
      parsed = new URL(trimmed);
    } catch {
      throw new BadRequestException('Invalid URL');
    }

    const host = parsed.hostname.replace(/^www\./, '').toLowerCase();
    if (!host.includes('youtube.com') && !host.includes('youtu.be')) {
      throw new BadRequestException('Only YouTube links are supported');
    }

    const playlistId = parsed.searchParams.get('list')?.trim();
    if (!playlistId) {
      throw new BadRequestException('No YouTube playlist id found in URL');
    }

    const feedUrl = `https://www.youtube.com/feeds/videos.xml?playlist_id=${encodeURIComponent(playlistId)}`;
    const feedResponse = await fetch(feedUrl);

    if (!feedResponse.ok) {
      throw new BadRequestException('Unable to fetch YouTube playlist');
    }

    const feedXml = await feedResponse.text();
    const matches = Array.from(feedXml.matchAll(/<yt:videoId>([^<]+)<\/yt:videoId>/g));
    const seen = new Set<string>();
    const tracks = matches
      .map((match) => match[1]?.trim())
      .filter((videoId): videoId is string => Boolean(videoId))
      .filter((videoId) => {
        if (seen.has(videoId)) {
          return false;
        }

        seen.add(videoId);
        return true;
      })
      .map((videoId) => `https://www.youtube.com/watch?v=${videoId}&list=${playlistId}`);

    return { tracks };
  }
}