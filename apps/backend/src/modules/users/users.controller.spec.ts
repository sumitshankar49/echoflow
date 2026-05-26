/// <reference types="jest" />

import { Test, TestingModule } from '@nestjs/testing';

import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;

  const usersServiceMock = {
    getMe: jest.fn(),
    updateProfile: jest.fn(),
    changePassword: jest.fn(),
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
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: usersServiceMock,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('forwards getMe to the users service', async () => {
    const response = { id: 'user-id', email: 'candy@example.com' };
    usersServiceMock.getMe.mockResolvedValue(response);

    await expect(controller.getMe(currentUser)).resolves.toEqual(response);
    expect(usersServiceMock.getMe).toHaveBeenCalledWith('user-id');
  });

  it('forwards updateProfile to the users service', async () => {
    const dto = { name: 'Updated User' };
    const response = { id: 'user-id', name: 'Updated User' };
    usersServiceMock.updateProfile.mockResolvedValue(response);

    await expect(controller.updateProfile(dto, currentUser)).resolves.toEqual(response);
    expect(usersServiceMock.updateProfile).toHaveBeenCalledWith('user-id', dto);
  });

  it('forwards changePassword to the users service', async () => {
    const dto = {
      newPassword: 'NewStrongPass123!',
      confirmPassword: 'NewStrongPass123!',
    };
    const response = { message: 'Password updated successfully' };
    usersServiceMock.changePassword.mockResolvedValue(response);

    await expect(controller.changePassword(dto, currentUser)).resolves.toEqual(response);
    expect(usersServiceMock.changePassword).toHaveBeenCalledWith('user-id', dto);
  });
});