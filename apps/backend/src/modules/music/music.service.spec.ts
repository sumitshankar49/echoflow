/// <reference types="jest" />

import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import { MusicService } from './music.service';

describe('MusicService', () => {
  let service: MusicService;

  const prismaMock = {
    playlist: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const currentUser: AuthenticatedUser = {
    userId: 'user-id',
    email: 'candy@example.com',
    name: 'Candy User',
    tokenType: 'access',
  };

  const playlistRecord = {
    id: 'playlist-id',
    name: 'Focus Mix',
    description: 'Work playlist',
    tracks: 'track-1,track-2',
    userId: 'user-id',
    createdAt: new Date('2026-05-26T00:00:00.000Z'),
    updatedAt: new Date('2026-05-26T00:00:00.000Z'),
  };

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MusicService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<MusicService>(MusicService);
  });

  it('creates a playlist and maps tracks', async () => {
    prismaMock.playlist.create.mockResolvedValue(playlistRecord);

    await expect(
      service.create({ name: 'Focus Mix', description: 'Work playlist', tracks: ['track-1', 'track-2'] }, currentUser),
    ).resolves.toEqual({
      ...playlistRecord,
      tracks: ['track-1', 'track-2'],
    });
  });

  it('returns paginated playlists', async () => {
    prismaMock.playlist.findMany.mockResolvedValue([playlistRecord]);
    prismaMock.playlist.count.mockResolvedValue(1);
    prismaMock.$transaction.mockImplementation(async (operations: Promise<unknown>[]) =>
      Promise.all(operations),
    );

    const result = await service.findAll(currentUser, { page: 1, limit: 20 });

    expect(result.total).toBe(1);
    expect(result.data[0].tracks).toEqual(['track-1', 'track-2']);
  });

  it('throws when playlist is not found in findOne', async () => {
    prismaMock.playlist.findFirst.mockResolvedValue(null);

    await expect(service.findOne('missing-playlist', currentUser)).rejects.toThrow(
      new NotFoundException('Playlist not found'),
    );
  });

  it('throws when non-owner tries to update playlist', async () => {
    prismaMock.playlist.findUnique.mockResolvedValue({
      ...playlistRecord,
      userId: 'another-user',
    });

    await expect(
      service.update('playlist-id', { name: 'Updated' }, currentUser),
    ).rejects.toThrow(new ForbiddenException('You do not have permission to update this playlist'));
  });

  it('deletes a playlist for owner', async () => {
    prismaMock.playlist.findUnique.mockResolvedValue(playlistRecord);
    prismaMock.playlist.delete.mockResolvedValue(playlistRecord);

    await expect(service.remove('playlist-id', currentUser)).resolves.toEqual({
      message: 'Playlist deleted successfully',
    });
  });

  it('throws on invalid link metadata URL', async () => {
    await expect(service.resolveLinkMetadata('not-a-url')).rejects.toThrow(
      new BadRequestException('Invalid URL'),
    );
  });

  it('returns empty metadata when provider response is not ok', async () => {
    const fetchSpy = jest.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
    } as Response);

    await expect(
      service.resolveLinkMetadata('https://open.spotify.com/track/abc123'),
    ).resolves.toEqual({});

    fetchSpy.mockRestore();
  });

  it('parses youtube playlist feed into unique track URLs', async () => {
    const feedXml = `
      <feed>
        <entry><yt:videoId>abc123</yt:videoId></entry>
        <entry><yt:videoId>def456</yt:videoId></entry>
        <entry><yt:videoId>abc123</yt:videoId></entry>
      </feed>
    `;
    const fetchSpy = jest.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      text: async () => feedXml,
    } as Response);

    await expect(
      service.resolveYouTubePlaylistTracks('https://www.youtube.com/playlist?list=PL123'),
    ).resolves.toEqual({
      tracks: [
        'https://www.youtube.com/watch?v=abc123&list=PL123',
        'https://www.youtube.com/watch?v=def456&list=PL123',
      ],
    });

    fetchSpy.mockRestore();
  });
});