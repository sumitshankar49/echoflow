/// <reference types="jest" />

import { Test, TestingModule } from '@nestjs/testing';

import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { CirclesController } from './circles.controller';
import { CirclesService } from './circles.service';

describe('CirclesController', () => {
  let controller: CirclesController;

  const circlesServiceMock = {
    findAll: jest.fn(),
    create: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    acceptInvitation: jest.fn(),
    declineInvitation: jest.fn(),
    removeMember: jest.fn(),
    leaveCircle: jest.fn(),
    inviteMember: jest.fn(),
  };

  const currentUser: AuthenticatedUser = {
    userId: 'owner-id',
    email: 'owner@example.com',
    name: 'Owner User',
    tokenType: 'access',
  };

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CirclesController],
      providers: [
        {
          provide: CirclesService,
          useValue: circlesServiceMock,
        },
      ],
    }).compile();

    controller = module.get<CirclesController>(CirclesController);
  });

  it('is defined', () => {
    expect(controller).toBeDefined();
  });

  it('forwards findAll to the circles service', async () => {
    const pagination = { page: 1, limit: 20 };
    const response = { data: [], total: 0, page: 1, totalPages: 0 };
    circlesServiceMock.findAll.mockResolvedValue(response);

    await expect(controller.findAll(pagination, currentUser)).resolves.toEqual(response);
    expect(circlesServiceMock.findAll).toHaveBeenCalledWith(currentUser, pagination);
  });

  it('forwards create to the circles service', async () => {
    const dto = { name: 'Inner Circle', description: 'Trusted people' };
    const response = { id: 'circle-id', ...dto };
    circlesServiceMock.create.mockResolvedValue(response);

    await expect(controller.create(dto, currentUser)).resolves.toEqual(response);
    expect(circlesServiceMock.create).toHaveBeenCalledWith(dto, currentUser);
  });

  it('forwards findOne to the circles service', async () => {
    const response = { id: 'circle-id', name: 'Inner Circle' };
    circlesServiceMock.findOne.mockResolvedValue(response);

    await expect(controller.findOne('circle-id', currentUser)).resolves.toEqual(response);
    expect(circlesServiceMock.findOne).toHaveBeenCalledWith('circle-id', currentUser);
  });

  it('forwards update to the circles service', async () => {
    const dto = { name: 'Updated Circle' };
    const response = { id: 'circle-id', ...dto };
    circlesServiceMock.update.mockResolvedValue(response);

    await expect(controller.update('circle-id', dto, currentUser)).resolves.toEqual(response);
    expect(circlesServiceMock.update).toHaveBeenCalledWith('circle-id', dto, currentUser);
  });

  it('forwards remove to the circles service', async () => {
    const response = { message: 'Circle deleted successfully' };
    circlesServiceMock.remove.mockResolvedValue(response);

    await expect(controller.remove('circle-id', currentUser)).resolves.toEqual(response);
    expect(circlesServiceMock.remove).toHaveBeenCalledWith('circle-id', currentUser);
  });

  it('forwards acceptInvitation to the circles service', async () => {
    const response = { id: 'membership-id', status: 'accepted' };
    circlesServiceMock.acceptInvitation.mockResolvedValue(response);

    await expect(controller.acceptInvitation('circle-id', currentUser)).resolves.toEqual(response);
    expect(circlesServiceMock.acceptInvitation).toHaveBeenCalledWith('circle-id', currentUser);
  });

  it('forwards declineInvitation to the circles service', async () => {
    const response = { message: 'Invitation declined' };
    circlesServiceMock.declineInvitation.mockResolvedValue(response);

    await expect(controller.declineInvitation('circle-id', currentUser)).resolves.toEqual(response);
    expect(circlesServiceMock.declineInvitation).toHaveBeenCalledWith('circle-id', currentUser);
  });

  it('forwards removeMember to the circles service', async () => {
    const response = { message: 'Member removed successfully' };
    circlesServiceMock.removeMember.mockResolvedValue(response);

    await expect(controller.removeMember('circle-id', 'member-id', currentUser)).resolves.toEqual(
      response,
    );
    expect(circlesServiceMock.removeMember).toHaveBeenCalledWith(
      'circle-id',
      'member-id',
      currentUser,
    );
  });

  it('forwards leaveCircle to the circles service', async () => {
    const response = { message: 'You have left the circle' };
    circlesServiceMock.leaveCircle.mockResolvedValue(response);

    await expect(controller.leaveCircle('circle-id', currentUser)).resolves.toEqual(response);
    expect(circlesServiceMock.leaveCircle).toHaveBeenCalledWith('circle-id', currentUser);
  });

  it('forwards inviteMember to the circles service', async () => {
    const dto = { email: 'member@example.com' };
    const response = { message: 'Invite email sent.' };
    circlesServiceMock.inviteMember.mockResolvedValue(response);

    await expect(controller.inviteMember('circle-id', dto, currentUser)).resolves.toEqual(response);
    expect(circlesServiceMock.inviteMember).toHaveBeenCalledWith('circle-id', dto, currentUser);
  });
});