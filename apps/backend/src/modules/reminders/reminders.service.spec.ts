/// <reference types="jest" />

import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import { RemindersService } from './reminders.service';

describe('RemindersService', () => {
  let service: RemindersService;

  const prismaMock = {
    reminder: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findFirst: jest.fn(),
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

  const reminderRecord = {
    id: 'reminder-id',
    title: 'Doctor Appointment',
    description: 'At 4 PM',
    remindAt: new Date('2026-05-27T16:00:00.000Z'),
    isCompleted: 0,
    userId: 'user-id',
    createdAt: new Date('2026-05-26T00:00:00.000Z'),
    updatedAt: new Date('2026-05-26T00:00:00.000Z'),
  };

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RemindersService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<RemindersService>(RemindersService);
  });

  it('creates a reminder and maps completion state', async () => {
    prismaMock.reminder.create.mockResolvedValue(reminderRecord);

    await expect(
      service.create(
        {
          title: 'Doctor Appointment',
          description: 'At 4 PM',
          remindAt: '2026-05-27T16:00:00.000Z',
          isCompleted: false,
        },
        currentUser,
      ),
    ).resolves.toEqual({
      ...reminderRecord,
      isCompleted: false,
    });
  });

  it('returns paginated reminders with filters', async () => {
    prismaMock.reminder.findMany.mockResolvedValue([reminderRecord]);
    prismaMock.reminder.count.mockResolvedValue(1);
    prismaMock.$transaction.mockImplementation(async (operations: Promise<unknown>[]) =>
      Promise.all(operations),
    );

    const result = await service.findAll(currentUser, {
      isCompleted: false,
      from: '2026-05-01',
      to: '2026-05-31',
      page: 1,
      limit: 20,
    });

    expect(result.total).toBe(1);
    expect(result.data[0]).toEqual({
      ...reminderRecord,
      isCompleted: false,
    });
    expect(prismaMock.reminder.findMany).toHaveBeenCalledWith({
      where: {
        userId: 'user-id',
        isCompleted: 0,
        remindAt: {
          gte: new Date('2026-05-01'),
          lt: new Date('2026-06-01T00:00:00.000Z'),
        },
      },
      orderBy: { remindAt: 'asc' },
      skip: 0,
      take: 20,
    });
  });

  it('throws when reminder is not found', async () => {
    prismaMock.reminder.findFirst.mockResolvedValue(null);

    await expect(service.findOne('missing-reminder', currentUser)).rejects.toThrow(
      new NotFoundException('Reminder not found'),
    );
  });

  it('updates an existing reminder', async () => {
    prismaMock.reminder.findFirst.mockResolvedValue(reminderRecord);
    prismaMock.reminder.update.mockResolvedValue({
      ...reminderRecord,
      title: 'Updated Reminder',
      isCompleted: 1,
    });

    await expect(
      service.update(
        'reminder-id',
        { title: 'Updated Reminder', isCompleted: true },
        currentUser,
      ),
    ).resolves.toEqual({
      ...reminderRecord,
      title: 'Updated Reminder',
      isCompleted: true,
    });
  });

  it('deletes an existing reminder', async () => {
    prismaMock.reminder.findFirst.mockResolvedValue(reminderRecord);
    prismaMock.reminder.delete.mockResolvedValue(reminderRecord);

    await expect(service.remove('reminder-id', currentUser)).resolves.toEqual({
      message: 'Reminder deleted successfully',
    });
  });
});