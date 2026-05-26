/// <reference types="jest" />

import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcryptjs';

import { PrismaService } from '../../prisma/prisma.service';
import { UsersService } from './users.service';

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
}));

describe('UsersService', () => {
  let service: UsersService;

  const hashMock = bcrypt.hash as jest.MockedFunction<typeof bcrypt.hash>;

  const prismaMock = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const baseUser = {
    id: 'user-id',
    name: 'Candy User',
    email: 'candy@example.com',
    gender: null,
    dob: null,
    mobileNumber: null,
    relationshipStatus: null,
    createdAt: new Date('2026-05-26T00:00:00.000Z'),
    updatedAt: new Date('2026-05-26T00:00:00.000Z'),
  };

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('returns the safe user profile', async () => {
    prismaMock.user.findUnique.mockResolvedValue(baseUser);

    await expect(service.getMe('user-id')).resolves.toEqual(baseUser);
  });

  it('throws when getMe cannot find the user', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(service.getMe('missing-user')).rejects.toThrow(
      new UnauthorizedException('User no longer exists'),
    );
  });

  it('updates the user profile', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 'user-id' });
    prismaMock.user.update.mockResolvedValue({
      ...baseUser,
      name: 'Updated User',
      gender: 'female',
      dob: new Date('1998-04-23T00:00:00.000Z'),
      mobileNumber: '+919999999999',
      relationshipStatus: 'single',
    });

    await expect(
      service.updateProfile('user-id', {
        name: 'Updated User',
        gender: 'female',
        dob: '1998-04-23',
        mobileNumber: '+919999999999',
        relationshipStatus: 'single',
      }),
    ).resolves.toEqual({
      ...baseUser,
      name: 'Updated User',
      gender: 'female',
      dob: new Date('1998-04-23T00:00:00.000Z'),
      mobileNumber: '+919999999999',
      relationshipStatus: 'single',
    });

    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: 'user-id' },
      data: {
        name: 'Updated User',
        gender: 'female',
        dob: new Date('1998-04-23'),
        mobileNumber: '+919999999999',
        relationshipStatus: 'single',
      },
      select: {
        id: true,
        name: true,
        email: true,
        gender: true,
        dob: true,
        mobileNumber: true,
        relationshipStatus: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  });

  it('throws when changing password with mismatched confirmation', async () => {
    await expect(
      service.changePassword('user-id', {
        newPassword: 'NewStrongPass123!',
        confirmPassword: 'Mismatch123!',
      }),
    ).rejects.toThrow(new BadRequestException('New password and confirm password do not match'));
  });

  it('updates the password hash', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'user-id',
      password: 'old-hash',
    });
    prismaMock.user.update.mockResolvedValue({ id: 'user-id' });
    hashMock.mockImplementation(async () => 'new-hash');

    await expect(
      service.changePassword('user-id', {
        newPassword: 'NewStrongPass123!',
        confirmPassword: 'NewStrongPass123!',
      }),
    ).resolves.toEqual({
      message: 'Password updated successfully',
    });

    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: 'user-id' },
      data: { password: 'new-hash' },
    });
  });
});