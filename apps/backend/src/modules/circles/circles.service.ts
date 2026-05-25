import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { CreateCircleDto } from './dto/create-circle.dto';
import { InviteCircleMemberDto } from './dto/invite-circle-member.dto';
import { UpdateCircleDto } from './dto/update-circle.dto';
import { CircleMember } from './entities/circle-member.entity';
import { Circle } from './entities/circle.entity';

@Injectable()
export class CirclesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  private readonly safeUserSelect = {
    id: true,
    name: true,
    email: true,
    gender: true,
    dob: true,
    mobileNumber: true,
    relationshipStatus: true,
    createdAt: true,
    updatedAt: true,
  } as const;

  private async attachMembers(circles: Circle[]): Promise<Circle[]> {
    if (circles.length === 0) {
      return circles;
    }

    const circleIds = circles.map((circle) => circle.id);
    const members = await this.prisma.circleMember.findMany({
      where: { circleId: { in: circleIds } },
      orderBy: { createdAt: 'asc' },
    });

    const uniqueUserIds = [...new Set(members.map((member) => member.userId))];
    const users = uniqueUserIds.length
      ? await this.prisma.user.findMany({
          where: { id: { in: uniqueUserIds } },
          select: this.safeUserSelect,
        })
      : [];

    const userById = new Map(users.map((user) => [user.id, user]));
    const membersByCircleId = new Map<string, CircleMember[]>();

    for (const member of members) {
      const bucket = membersByCircleId.get(member.circleId) ?? [];
      bucket.push({
        ...member,
        user: userById.get(member.userId),
      } as CircleMember);
      membersByCircleId.set(member.circleId, bucket);
    }

    return circles.map((circle) => ({
      ...circle,
      members: membersByCircleId.get(circle.id) ?? [],
    }));
  }

  async create(createCircleDto: CreateCircleDto, currentUser: AuthenticatedUser): Promise<Circle> {
    const savedCircle = await this.prisma.$transaction(async (tx) => {
      const circle = await tx.circle.create({
        data: {
          name: createCircleDto.name,
          description: createCircleDto.description ?? null,
          ownerId: currentUser.userId,
        },
      });

      await tx.circleMember.create({
        data: {
          circleId: circle.id,
          userId: currentUser.userId,
          role: 'owner',
          status: 'accepted',
        },
      });

      return circle;
    });

    return savedCircle;
  }

  async findAll(currentUser: AuthenticatedUser, pagination?: PaginationQueryDto): Promise<PaginatedResponseDto<Circle>> {
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 20;
    const skip = (page - 1) * limit;

    const memberCircleRows = await this.prisma.circleMember.findMany({
      where: { userId: currentUser.userId },
      select: { circleId: true },
    });
    const memberCircleIds = memberCircleRows.map((row) => row.circleId);

    const where = {
      OR: [
        { ownerId: currentUser.userId },
        ...(memberCircleIds.length > 0 ? [{ id: { in: memberCircleIds } }] : []),
      ],
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.circle.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.circle.count({ where }),
    ]);

    const hydrated = await this.attachMembers(data as Circle[]);

    return new PaginatedResponseDto(hydrated, total, page, limit);
  }

  async findOne(id: string, currentUser: AuthenticatedUser): Promise<Circle> {
    const circle = await this.prisma.circle.findUnique({ where: { id } });

    if (!circle) {
      throw new NotFoundException('Circle not found');
    }

    const membership = await this.prisma.circleMember.findUnique({
      where: { circleId_userId: { circleId: id, userId: currentUser.userId } },
    });

    if (!membership && circle.ownerId !== currentUser.userId) {
      throw new ForbiddenException('You do not have access to this circle');
    }

    const [hydratedCircle] = await this.attachMembers([circle as Circle]);
    return hydratedCircle;
  }

  async update(
    id: string,
    updateCircleDto: UpdateCircleDto,
    currentUser: AuthenticatedUser,
  ): Promise<Circle> {
    const circle = await this.prisma.circle.findUnique({ where: { id } });

    if (!circle) {
      throw new NotFoundException('Circle not found');
    }

    if (circle.ownerId !== currentUser.userId) {
      throw new ForbiddenException('Only the circle owner can update this circle');
    }

    const updatedCircle = await this.prisma.circle.update({
      where: { id },
      data: {
        ...(updateCircleDto.name !== undefined ? { name: updateCircleDto.name } : {}),
        ...(updateCircleDto.description !== undefined
          ? { description: updateCircleDto.description }
          : {}),
      },
    });

    return updatedCircle;
  }

  async remove(id: string, currentUser: AuthenticatedUser): Promise<{ message: string }> {
    const circle = await this.prisma.circle.findUnique({ where: { id } });

    if (!circle) {
      throw new NotFoundException('Circle not found');
    }

    if (circle.ownerId !== currentUser.userId) {
      throw new ForbiddenException('Only the circle owner can delete this circle');
    }

    await this.prisma.$transaction([
      this.prisma.circleMember.deleteMany({ where: { circleId: id } }),
      this.prisma.circle.delete({ where: { id } }),
    ]);

    return { message: 'Circle deleted successfully' };
  }

  async acceptInvitation(circleId: string, currentUser: AuthenticatedUser): Promise<CircleMember> {
    const membership = await this.prisma.circleMember.findUnique({
      where: { circleId_userId: { circleId, userId: currentUser.userId } },
    });

    if (!membership) {
      throw new NotFoundException('No invitation found for this circle');
    }

    return this.prisma.circleMember.update({
      where: { id: membership.id },
      data: { status: 'accepted' },
    });
  }

  async declineInvitation(circleId: string, currentUser: AuthenticatedUser): Promise<{ message: string }> {
    const membership = await this.prisma.circleMember.findUnique({
      where: { circleId_userId: { circleId, userId: currentUser.userId } },
    });

    if (!membership) {
      throw new NotFoundException('No invitation found for this circle');
    }

    await this.prisma.circleMember.delete({ where: { id: membership.id } });
    return { message: 'Invitation declined' };
  }

  async removeMember(
    circleId: string,
    memberId: string,
    currentUser: AuthenticatedUser,
  ): Promise<{ message: string }> {
    const circle = await this.prisma.circle.findUnique({ where: { id: circleId } });

    if (!circle) {
      throw new NotFoundException('Circle not found');
    }

    if (circle.ownerId !== currentUser.userId) {
      throw new ForbiddenException('Only the circle owner can remove members');
    }

    const membership = await this.prisma.circleMember.findFirst({
      where: { id: memberId, circleId },
    });

    if (!membership) {
      throw new NotFoundException('Member not found in this circle');
    }

    if (membership.userId === currentUser.userId) {
      throw new BadRequestException('Owner cannot remove themselves from the circle');
    }

    await this.prisma.circleMember.delete({ where: { id: membership.id } });
    return { message: 'Member removed successfully' };
  }

  async leaveCircle(circleId: string, currentUser: AuthenticatedUser): Promise<{ message: string }> {
    const circle = await this.prisma.circle.findUnique({ where: { id: circleId } });

    if (!circle) {
      throw new NotFoundException('Circle not found');
    }

    if (circle.ownerId === currentUser.userId) {
      throw new BadRequestException('Circle owner cannot leave; delete the circle instead');
    }

    const membership = await this.prisma.circleMember.findUnique({
      where: { circleId_userId: { circleId, userId: currentUser.userId } },
    });

    if (!membership) {
      throw new NotFoundException('You are not a member of this circle');
    }

    await this.prisma.circleMember.delete({ where: { id: membership.id } });
    return { message: 'You have left the circle' };
  }

  async inviteMember(
    circleId: string,
    inviteDto: InviteCircleMemberDto,
    currentUser: AuthenticatedUser,
  ): Promise<CircleMember | { message: string }> {
    const circle = await this.prisma.circle.findUnique({ where: { id: circleId } });

    if (!circle) {
      throw new NotFoundException('Circle not found');
    }

    if (circle.ownerId !== currentUser.userId) {
      throw new ForbiddenException('Only circle owner can invite members');
    }

    const invitee = await this.prisma.user.findUnique({
      where: { email: inviteDto.email.toLowerCase() },
      select: { id: true, email: true, name: true },
    });

    if (!invitee) {
      const frontendBaseUrl = this.configService.get<string>('mail.frontendBaseUrl') ?? 'http://localhost:3000';
      const inviteUrl = `${frontendBaseUrl}/register?inviteCircleId=${encodeURIComponent(circleId)}&inviteEmail=${encodeURIComponent(inviteDto.email.toLowerCase())}`;

      await this.mailService.sendCircleInviteEmail(
        inviteDto.email.toLowerCase(),
        circle.name,
        inviteUrl,
        currentUser.name,
      );

      return {
        message:
          'Invite email sent. If this person has not signed up yet, they can register and then join from the invite link.',
      };
    }

    const existingMember = await this.prisma.circleMember.findUnique({
      where: {
        circleId_userId: {
          circleId,
          userId: invitee.id,
        },
      },
    });

    if (existingMember) {
      throw new BadRequestException('User is already part of this circle');
    }

    return this.prisma.circleMember.create({
      data: {
        circleId,
        userId: invitee.id,
        role: 'member',
        status: 'invited',
      },
    });
  }
}