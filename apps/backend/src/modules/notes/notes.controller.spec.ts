/// <reference types="jest" />

import { Test, TestingModule } from '@nestjs/testing';

import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { NotesController } from './notes.controller';
import { NotesService } from './notes.service';

describe('NotesController', () => {
  let controller: NotesController;

  const notesServiceMock = {
    findAll: jest.fn(),
    create: jest.fn(),
    search: jest.fn(),
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
      controllers: [NotesController],
      providers: [
        {
          provide: NotesService,
          useValue: notesServiceMock,
        },
      ],
    }).compile();

    controller = module.get<NotesController>(NotesController);
  });

  it('forwards findAll to the notes service', async () => {
    const filter = { page: 1, limit: 20 };
    const response = { data: [], total: 0, page: 1, totalPages: 0 };
    notesServiceMock.findAll.mockResolvedValue(response);

    await expect(controller.findAll(filter, currentUser)).resolves.toEqual(response);
    expect(notesServiceMock.findAll).toHaveBeenCalledWith(currentUser, filter);
  });

  it('forwards create to the notes service', async () => {
    const dto = { title: 'Meeting Notes', content: 'Important content' };
    const response = { id: 'note-id', ...dto };
    notesServiceMock.create.mockResolvedValue(response);

    await expect(controller.create(dto, currentUser)).resolves.toEqual(response);
    expect(notesServiceMock.create).toHaveBeenCalledWith(dto, currentUser);
  });

  it('forwards search to the notes service', async () => {
    const response = [{ id: 'note-id', title: 'Meeting Notes' }];
    notesServiceMock.search.mockResolvedValue(response);

    await expect(controller.search('meeting', currentUser)).resolves.toEqual(response);
    expect(notesServiceMock.search).toHaveBeenCalledWith('meeting', currentUser);
  });

  it('forwards findOne to the notes service', async () => {
    const response = { id: 'note-id' };
    notesServiceMock.findOne.mockResolvedValue(response);

    await expect(controller.findOne('note-id', currentUser)).resolves.toEqual(response);
    expect(notesServiceMock.findOne).toHaveBeenCalledWith('note-id', currentUser);
  });

  it('forwards update to the notes service', async () => {
    const dto = { title: 'Updated Title' };
    const response = { id: 'note-id', title: 'Updated Title' };
    notesServiceMock.update.mockResolvedValue(response);

    await expect(controller.update('note-id', dto, currentUser)).resolves.toEqual(response);
    expect(notesServiceMock.update).toHaveBeenCalledWith('note-id', dto, currentUser);
  });

  it('forwards remove to the notes service', async () => {
    const response = { message: 'Note deleted successfully' };
    notesServiceMock.remove.mockResolvedValue(response);

    await expect(controller.remove('note-id', currentUser)).resolves.toEqual(response);
    expect(notesServiceMock.remove).toHaveBeenCalledWith('note-id', currentUser);
  });
});