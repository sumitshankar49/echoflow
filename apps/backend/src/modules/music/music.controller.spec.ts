/// <reference types="jest" />

import { Test, TestingModule } from '@nestjs/testing';

import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { MusicController } from './music.controller';
import { MusicService } from './music.service';

describe('MusicController', () => {
  let controller: MusicController;

  const musicServiceMock = {
    findAll: jest.fn(),
    create: jest.fn(),
    resolveLinkMetadata: jest.fn(),
    resolveYouTubePlaylistTracks: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const currentUser: AuthenticatedUser = {
    userId: 'user-id',
    email: 'candy@example.com',
    name: 'Candy User',
    tokenType: 'access',
  };

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MusicController],
      providers: [
        {
          provide: MusicService,
          useValue: musicServiceMock,
        },
      ],
    }).compile();

    controller = module.get<MusicController>(MusicController);
  });

  it('forwards findAll to the music service', async () => {
    const pagination = { page: 1, limit: 20 };
    const response = { data: [], total: 0, page: 1, totalPages: 0 };
    musicServiceMock.findAll.mockResolvedValue(response);

    await expect(controller.findAll(pagination, currentUser)).resolves.toEqual(response);
    expect(musicServiceMock.findAll).toHaveBeenCalledWith(currentUser, pagination);
  });

  it('forwards create to the music service', async () => {
    const dto = { name: 'Focus Mix' };
    const response = { id: 'playlist-id', ...dto };
    musicServiceMock.create.mockResolvedValue(response);

    await expect(controller.create(dto, currentUser)).resolves.toEqual(response);
    expect(musicServiceMock.create).toHaveBeenCalledWith(dto, currentUser);
  });

  it('forwards resolveLinkMetadata to the music service', async () => {
    const response = { title: 'Song', artist: 'Artist' };
    musicServiceMock.resolveLinkMetadata.mockResolvedValue(response);

    await expect(controller.resolveLinkMetadata('https://open.spotify.com/track/abc', currentUser)).resolves.toEqual(response);
    expect(musicServiceMock.resolveLinkMetadata).toHaveBeenCalledWith('https://open.spotify.com/track/abc');
  });

  it('forwards resolveYouTubePlaylistTracks to the music service', async () => {
    const response = { tracks: ['https://www.youtube.com/watch?v=abc&list=PL123'] };
    musicServiceMock.resolveYouTubePlaylistTracks.mockResolvedValue(response);

    await expect(
      controller.resolveYouTubePlaylistTracks('https://www.youtube.com/playlist?list=PL123', currentUser),
    ).resolves.toEqual(response);
    expect(musicServiceMock.resolveYouTubePlaylistTracks).toHaveBeenCalledWith(
      'https://www.youtube.com/playlist?list=PL123',
    );
  });

  it('forwards findOne to the music service', async () => {
    const response = { id: 'playlist-id' };
    musicServiceMock.findOne.mockResolvedValue(response);

    await expect(controller.findOne('playlist-id', currentUser)).resolves.toEqual(response);
    expect(musicServiceMock.findOne).toHaveBeenCalledWith('playlist-id', currentUser);
  });

  it('forwards update to the music service', async () => {
    const dto = { name: 'Updated' };
    const response = { id: 'playlist-id', ...dto };
    musicServiceMock.update.mockResolvedValue(response);

    await expect(controller.update('playlist-id', dto, currentUser)).resolves.toEqual(response);
    expect(musicServiceMock.update).toHaveBeenCalledWith('playlist-id', dto, currentUser);
  });

  it('forwards remove to the music service', async () => {
    const response = { message: 'Playlist deleted successfully' };
    musicServiceMock.remove.mockResolvedValue(response);

    await expect(controller.remove('playlist-id', currentUser)).resolves.toEqual(response);
    expect(musicServiceMock.remove).toHaveBeenCalledWith('playlist-id', currentUser);
  });
});