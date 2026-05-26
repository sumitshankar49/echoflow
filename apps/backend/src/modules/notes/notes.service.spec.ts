/// <reference types="jest" />

import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import { NotesService } from './notes.service';

describe('NotesService', () => {
  let service: NotesService;

  const prismaMock = {
    note: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn(),
    $queryRaw: jest.fn(),
  };

  const currentUser: AuthenticatedUser = {
    userId: 'user-id',
    email: 'candy@example.com',
    name: 'Candy User',
    tokenType: 'access',
  };

  const noteRecord = {
    id: 'note-id',
    title: 'Meeting Notes',
    content: 'Important content',
    voiceUrl: null,
    tags: 'work,project',
    isFavorite: 1,
    userId: 'user-id',
    createdAt: new Date('2026-05-26T00:00:00.000Z'),
    updatedAt: new Date('2026-05-26T00:00:00.000Z'),
  };

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotesService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<NotesService>(NotesService);
  });

  it('creates a note and maps tags and favorite state', async () => {
    prismaMock.note.create.mockResolvedValue(noteRecord);

    await expect(
      service.create(
        {
          title: 'Meeting Notes',
          content: 'Important content',
          tags: ['work', 'project'],
          isFavorite: true,
        },
        currentUser,
      ),
    ).resolves.toEqual({
      ...noteRecord,
      tags: ['work', 'project'],
      isFavorite: true,
    });
  });

  it('returns paginated notes without tag filtering', async () => {
    prismaMock.note.findMany.mockResolvedValue([noteRecord]);
    prismaMock.note.count.mockResolvedValue(1);
    prismaMock.$transaction.mockImplementation(async (operations: Promise<unknown>[]) =>
      Promise.all(operations),
    );

    const result = await service.findAll(currentUser, { page: 1, limit: 20, isFavorite: true });

    expect(result.total).toBe(1);
    expect(result.data[0]).toEqual({
      ...noteRecord,
      tags: ['work', 'project'],
      isFavorite: true,
    });
  });

  it('returns paginated notes with tag filtering via raw queries', async () => {
    prismaMock.$queryRaw
      .mockResolvedValueOnce([noteRecord])
      .mockResolvedValueOnce([{ total: 1 }]);

    const result = await service.findAll(currentUser, { tag: 'work', page: 1, limit: 20 });

    expect(result.total).toBe(1);
    expect(prismaMock.$queryRaw).toHaveBeenCalledTimes(2);
    expect(result.data[0].tags).toEqual(['work', 'project']);
  });

  it('returns all notes when search query is blank', async () => {
    prismaMock.note.findMany.mockResolvedValue([noteRecord]);

    const result = await service.search('   ', currentUser);

    expect(prismaMock.note.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-id' },
      orderBy: { updatedAt: 'desc' },
    });
    expect(result).toHaveLength(1);
  });

  it('throws when a note is not found', async () => {
    prismaMock.note.findFirst.mockResolvedValue(null);

    await expect(service.findOne('missing-note', currentUser)).rejects.toThrow(
      new NotFoundException('Note not found'),
    );
  });

  it('updates an existing note', async () => {
    prismaMock.note.findFirst.mockResolvedValue(noteRecord);
    prismaMock.note.update.mockResolvedValue({
      ...noteRecord,
      title: 'Updated Title',
      tags: 'focus,deep work',
      isFavorite: 0,
    });

    await expect(
      service.update(
        'note-id',
        { title: 'Updated Title', tags: ['focus', 'deep work'], isFavorite: false },
        currentUser,
      ),
    ).resolves.toEqual({
      ...noteRecord,
      title: 'Updated Title',
      tags: ['focus', 'deep work'],
      isFavorite: false,
    });
  });

  it('deletes an existing note', async () => {
    prismaMock.note.findFirst.mockResolvedValue(noteRecord);
    prismaMock.note.delete.mockResolvedValue(noteRecord);

    await expect(service.remove('note-id', currentUser)).resolves.toEqual({
      message: 'Note deleted successfully',
    });
  });
});