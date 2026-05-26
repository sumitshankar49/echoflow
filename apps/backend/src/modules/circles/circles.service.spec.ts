/// <reference types="jest" />

import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { CirclesService } from './circles.service';

describe('CirclesService', () => {
  let service: CirclesService;

  const prismaMock = {
    circle: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    circleMember: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const configServiceMock = {
    get: jest.fn(),
  };

  const mailServiceMock = {
    sendCircleInviteEmail: jest.fn(),
  };

  const currentUser: AuthenticatedUser = {
    userId: 'owner-id',
    email: 'owner@example.com',
    name: 'Owner User',
    tokenType: 'access',
  };

  const baseCircle = {
    id: 'circle-id',
    name: 'Inner Circle',
    description: 'Trusted people',
    ownerId: 'owner-id',
    createdAt: new Date('2026-05-26T00:00:00.000Z'),
    updatedAt: new Date('2026-05-26T00:00:00.000Z'),
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    configServiceMock.get.mockImplementation((key: string) => {
      if (key === 'mail.frontendBaseUrl') {
        return 'http://localhost:3000';
      }

      return undefined;
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CirclesService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
        {
          provide: ConfigService,
          useValue: configServiceMock,
        },
        {
          provide: MailService,
          useValue: mailServiceMock,
        },
      ],
    }).compile();

    service = module.get<CirclesService>(CirclesService);
  });

  it('creates a circle and owner membership', async () => {
    const txMock = {
      circle: {
        create: jest.fn().mockResolvedValue(baseCircle),
      },
      circleMember: {
        create: jest.fn().mockResolvedValue({ id: 'membership-id' }),
      },
    };

    prismaMock.$transaction.mockImplementation(
      async (callback: (tx: typeof txMock) => Promise<unknown>) => callback(txMock),
    );

    await expect(
      service.create({ name: 'Inner Circle', description: 'Trusted people' }, currentUser),
    ).resolves.toEqual(baseCircle);

    expect(txMock.circle.create).toHaveBeenCalledWith({
      data: {
        name: 'Inner Circle',
        description: 'Trusted people',
        ownerId: 'owner-id',
      },
    });
    expect(txMock.circleMember.create).toHaveBeenCalledWith({
      data: {
        circleId: 'circle-id',
        userId: 'owner-id',
        role: 'owner',
        status: 'accepted',
      },
    });
  });

  it('returns paginated circles with attached members', async () => {
    prismaMock.circleMember.findMany
      .mockResolvedValueOnce([{ circleId: 'circle-id' }])
      .mockResolvedValueOnce([
        {
          id: 'membership-id',
          circleId: 'circle-id',
          userId: 'owner-id',
          role: 'owner',
          status: 'accepted',
          createdAt: new Date('2026-05-26T00:00:00.000Z'),
          updatedAt: new Date('2026-05-26T00:00:00.000Z'),
        },
      ]);
    prismaMock.circle.findMany.mockResolvedValue([baseCircle]);
    prismaMock.circle.count.mockResolvedValue(1);
    prismaMock.user.findMany.mockResolvedValue([
      {
        id: 'owner-id',
        name: 'Owner User',
        email: 'owner@example.com',
        gender: null,
        dob: null,
        mobileNumber: null,
        relationshipStatus: null,
        createdAt: new Date('2026-05-26T00:00:00.000Z'),
        updatedAt: new Date('2026-05-26T00:00:00.000Z'),
      },
    ]);
    prismaMock.$transaction.mockImplementation(async (operations: Promise<unknown>[]) =>
      Promise.all(operations),
    );

    const result = await service.findAll(currentUser, { page: 1, limit: 20 });

    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toEqual({
      ...baseCircle,
      members: [
        expect.objectContaining({
          id: 'membership-id',
          userId: 'owner-id',
          user: expect.objectContaining({ id: 'owner-id', email: 'owner@example.com' }),
        }),
      ],
    });
  });

  it('throws when a circle is not found in findOne', async () => {
    prismaMock.circle.findUnique.mockResolvedValue(null);

    await expect(service.findOne('missing-circle', currentUser)).rejects.toThrow(
      new NotFoundException('Circle not found'),
    );
  });

  it('throws when the user has no access to a circle', async () => {
    prismaMock.circle.findUnique.mockResolvedValue({
      ...baseCircle,
      ownerId: 'another-owner',
    });
    prismaMock.circleMember.findUnique.mockResolvedValue(null);

    await expect(service.findOne('circle-id', currentUser)).rejects.toThrow(
      new ForbiddenException('You do not have access to this circle'),
    );
  });

  it('updates a circle for the owner', async () => {
    prismaMock.circle.findUnique.mockResolvedValue(baseCircle);
    prismaMock.circle.update.mockResolvedValue({
      ...baseCircle,
      name: 'Updated Circle',
    });

    await expect(
      service.update('circle-id', { name: 'Updated Circle' }, currentUser),
    ).resolves.toEqual({
      ...baseCircle,
      name: 'Updated Circle',
    });

    expect(prismaMock.circle.update).toHaveBeenCalledWith({
      where: { id: 'circle-id' },
      data: { name: 'Updated Circle' },
    });
  });

  it('throws when a non-owner updates a circle', async () => {
    prismaMock.circle.findUnique.mockResolvedValue({
      ...baseCircle,
      ownerId: 'another-owner',
    });

    await expect(
      service.update('circle-id', { name: 'Updated Circle' }, currentUser),
    ).rejects.toThrow(new ForbiddenException('Only the circle owner can update this circle'));
  });

  it('deletes a circle for the owner', async () => {
    prismaMock.circle.findUnique.mockResolvedValue(baseCircle);
    prismaMock.circleMember.deleteMany.mockResolvedValue({ count: 1 });
    prismaMock.circle.delete.mockResolvedValue(baseCircle);
    prismaMock.$transaction.mockImplementation(async (operations: Promise<unknown>[]) =>
      Promise.all(operations),
    );

    await expect(service.remove('circle-id', currentUser)).resolves.toEqual({
      message: 'Circle deleted successfully',
    });
  });

  it('accepts an invitation when membership exists', async () => {
    prismaMock.circleMember.findUnique.mockResolvedValue({ id: 'membership-id' });
    prismaMock.circleMember.update.mockResolvedValue({
      id: 'membership-id',
      status: 'accepted',
    });

    await expect(service.acceptInvitation('circle-id', currentUser)).resolves.toEqual({
      id: 'membership-id',
      status: 'accepted',
    });
  });

  it('declines an invitation when membership exists', async () => {
    prismaMock.circleMember.findUnique.mockResolvedValue({ id: 'membership-id' });
    prismaMock.circleMember.delete.mockResolvedValue({ id: 'membership-id' });

    await expect(service.declineInvitation('circle-id', currentUser)).resolves.toEqual({
      message: 'Invitation declined',
    });
  });

  it('prevents the owner from removing themselves', async () => {
    prismaMock.circle.findUnique.mockResolvedValue(baseCircle);
    prismaMock.circleMember.findFirst.mockResolvedValue({
      id: 'membership-id',
      circleId: 'circle-id',
      userId: 'owner-id',
    });

    await expect(service.removeMember('circle-id', 'membership-id', currentUser)).rejects.toThrow(
      new BadRequestException('Owner cannot remove themselves from the circle'),
    );
  });

  it('allows a non-owner member to leave a circle', async () => {
    prismaMock.circle.findUnique.mockResolvedValue(baseCircle);
    prismaMock.circleMember.findUnique.mockResolvedValue({
      id: 'membership-id',
      circleId: 'circle-id',
      userId: 'member-id',
    });
    prismaMock.circleMember.delete.mockResolvedValue({ id: 'membership-id' });

    await expect(
      service.leaveCircle('circle-id', {
        ...currentUser,
        userId: 'member-id',
      }),
    ).resolves.toEqual({
      message: 'You have left the circle',
    });
  });

  it('sends an invite email when the invited user does not exist', async () => {
    prismaMock.circle.findUnique.mockResolvedValue(baseCircle);
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(
      service.inviteMember(
        'circle-id',
        { email: 'newmember@example.com' },
        currentUser,
      ),
    ).resolves.toEqual({
      message:
        'Invite email sent. If this person has not signed up yet, they can register and then join from the invite link.',
    });

    expect(mailServiceMock.sendCircleInviteEmail).toHaveBeenCalledWith(
      'newmember@example.com',
      'Inner Circle',
      'http://localhost:3000/register?inviteCircleId=circle-id&inviteEmail=newmember%40example.com',
      'Owner User',
    );
  });

  it('throws when the invited user is already in the circle', async () => {
    prismaMock.circle.findUnique.mockResolvedValue(baseCircle);
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'member-id',
      email: 'member@example.com',
      name: 'Member User',
    });
    prismaMock.circleMember.findUnique.mockResolvedValue({ id: 'membership-id' });

    await expect(
      service.inviteMember('circle-id', { email: 'member@example.com' }, currentUser),
    ).rejects.toThrow(new BadRequestException('User is already part of this circle'));
  });
});