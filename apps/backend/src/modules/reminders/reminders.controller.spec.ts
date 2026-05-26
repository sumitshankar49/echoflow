/// <reference types="jest" />

import { Test, TestingModule } from '@nestjs/testing';

import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { RemindersController } from './reminders.controller';
import { RemindersService } from './reminders.service';

describe('RemindersController', () => {
  let controller: RemindersController;

  const remindersServiceMock = {
    findAll: jest.fn(),
    create: jest.fn(),
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
      controllers: [RemindersController],
      providers: [
        {
          provide: RemindersService,
          useValue: remindersServiceMock,
        },
      ],
    }).compile();

    controller = module.get<RemindersController>(RemindersController);
  });

  it('forwards findAll to the reminders service', async () => {
    const filter = { page: 1, limit: 20 };
    const response = { data: [], total: 0, page: 1, totalPages: 0 };
    remindersServiceMock.findAll.mockResolvedValue(response);

    await expect(controller.findAll(filter, currentUser)).resolves.toEqual(response);
    expect(remindersServiceMock.findAll).toHaveBeenCalledWith(currentUser, filter);
  });

  it('forwards create to the reminders service', async () => {
    const dto = { title: 'Doctor Appointment', remindAt: '2026-05-27T16:00:00.000Z' };
    const response = { id: 'reminder-id', ...dto };
    remindersServiceMock.create.mockResolvedValue(response);

    await expect(controller.create(dto, currentUser)).resolves.toEqual(response);
    expect(remindersServiceMock.create).toHaveBeenCalledWith(dto, currentUser);
  });

  it('forwards findOne to the reminders service', async () => {
    const response = { id: 'reminder-id' };
    remindersServiceMock.findOne.mockResolvedValue(response);

    await expect(controller.findOne('reminder-id', currentUser)).resolves.toEqual(response);
    expect(remindersServiceMock.findOne).toHaveBeenCalledWith('reminder-id', currentUser);
  });

  it('forwards update to the reminders service', async () => {
    const dto = { title: 'Updated Reminder' };
    const response = { id: 'reminder-id', title: 'Updated Reminder' };
    remindersServiceMock.update.mockResolvedValue(response);

    await expect(controller.update('reminder-id', dto, currentUser)).resolves.toEqual(response);
    expect(remindersServiceMock.update).toHaveBeenCalledWith('reminder-id', dto, currentUser);
  });

  it('forwards remove to the reminders service', async () => {
    const response = { message: 'Reminder deleted successfully' };
    remindersServiceMock.remove.mockResolvedValue(response);

    await expect(controller.remove('reminder-id', currentUser)).resolves.toEqual(response);
    expect(remindersServiceMock.remove).toHaveBeenCalledWith('reminder-id', currentUser);
  });
});