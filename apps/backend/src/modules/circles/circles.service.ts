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
import { ShareCircleNoteDto } from './dto/share-circle-note.dto';
import { UpdateCircleDto } from './dto/update-circle.dto';
import { CircleMember } from './entities/circle-member.entity';
import { CircleSharedNoteEntity } from './entities/circle-shared-note.entity';
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
  } as const;

  private mapTagsFromDb(tags: string | null): string[] | null {
    if (!tags) {
      return null;
    }

    const parsed = tags.split(',').map((tag) => tag.trim()).filter(Boolean);
    return parsed.length > 0 ? parsed : null;
  }

  private mapSharedNote(record: {
    id: string;
    circleId: string;
    noteId: string;
    sharedByUserId: string;
    createdAt: Date;
    note: {
      id: string;
      title: string;
      content: string;
      tags: string | null;
      isFavorite: number;
      userId: string;
      createdAt: Date;
      updatedAt: Date;
    };
    sharedBy?: {
      id: string;
      name: string;
      email: string;
    } | null;
  }): CircleSharedNoteEntity {
    return {
      id: record.id,
      circleId: record.circleId,
      noteId: record.noteId,
      sharedByUserId: record.sharedByUserId,
      createdAt: record.createdAt,
      note: {
        id: record.note.id,
        title: record.note.title,
        content: record.note.content,
        tags: this.mapTagsFromDb(record.note.tags),
        isFavorite: Boolean(record.note.isFavorite),
        userId: record.note.userId,
        createdAt: record.note.createdAt,
        updatedAt: record.note.updatedAt,
      },
      sharedBy: record.sharedBy ?? undefined,
    };
  }

  private async getCircleAccess(circleId: string, currentUser: AuthenticatedUser): Promise<{
    circle: Circle;
    membership: { id: string; status: string; role: string; userId: string } | null;
    isOwner: boolean;
  }> {
    const circle = await this.prisma.circle.findUnique({ where: { id: circleId } });

    if (!circle) {
      throw new NotFoundException('Circle not found');
    }

    const membership = await this.prisma.circleMember.findUnique({
      where: { circleId_userId: { circleId, userId: currentUser.userId } },
    });

    const isOwner = circle.ownerId === currentUser.userId;

    if (!membership && !isOwner) {
      throw new ForbiddenException('You do not have access to this circle');
    }

    return {
      circle: circle as Circle,
      membership,
      isOwner,
    };
  }

  private async getCircleCollaboratorAccess(circleId: string, currentUser: AuthenticatedUser) {
    const access = await this.getCircleAccess(circleId, currentUser);

    if (!access.isOwner && access.membership?.status !== 'accepted') {
      throw new ForbiddenException('You must accept the invitation before sharing notes');
    }

    return access;
  }

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
    const { circle } = await this.getCircleAccess(id, currentUser);
    const [hydratedCircle] = await this.attachMembers([circle]);
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

  async listSharedNotes(circleId: string, currentUser: AuthenticatedUser): Promise<CircleSharedNoteEntity[]> {
    await this.getCircleAccess(circleId, currentUser);

    const sharedNotes = await this.prisma.circleSharedNote.findMany({
      where: { circleId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        circleId: true,
        noteId: true,
        sharedByUserId: true,
        createdAt: true,
        note: {
          select: {
            id: true,
            title: true,
            content: true,
            tags: true,
            isFavorite: true,
            userId: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        sharedBy: {
          select: this.safeUserSelect,
        },
      },
    });

    return sharedNotes.map((sharedNote) => this.mapSharedNote(sharedNote));
  }

  async shareNote(
    circleId: string,
    shareCircleNoteDto: ShareCircleNoteDto,
    currentUser: AuthenticatedUser,
  ): Promise<CircleSharedNoteEntity> {
    await this.getCircleCollaboratorAccess(circleId, currentUser);

    const note = await this.prisma.note.findFirst({
      where: {
        id: shareCircleNoteDto.noteId,
        userId: currentUser.userId,
      },
      select: {
        id: true,
      },
    });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    const existingSharedNote = await this.prisma.circleSharedNote.findUnique({
      where: {
        circleId_noteId: {
          circleId,
          noteId: shareCircleNoteDto.noteId,
        },
      },
      select: { id: true },
    });

    if (existingSharedNote) {
      throw new BadRequestException('Note is already shared in this circle');
    }

    const created = await this.prisma.circleSharedNote.create({
      data: {
        circleId,
        noteId: shareCircleNoteDto.noteId,
        sharedByUserId: currentUser.userId,
      },
      select: {
        id: true,
        circleId: true,
        noteId: true,
        sharedByUserId: true,
        createdAt: true,
        note: {
          select: {
            id: true,
            title: true,
            content: true,
            tags: true,
            isFavorite: true,
            userId: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        sharedBy: {
          select: this.safeUserSelect,
        },
      },
    });

    return this.mapSharedNote(created);
  }

  async unshareNote(
    circleId: string,
    noteId: string,
    currentUser: AuthenticatedUser,
  ): Promise<{ message: string }> {
    const access = await this.getCircleCollaboratorAccess(circleId, currentUser);

    const sharedNote = await this.prisma.circleSharedNote.findUnique({
      where: {
        circleId_noteId: {
          circleId,
          noteId,
        },
      },
      select: {
        id: true,
        sharedByUserId: true,
      },
    });

    if (!sharedNote) {
      throw new NotFoundException('Shared note not found in this circle');
    }

    if (!access.isOwner && sharedNote.sharedByUserId !== currentUser.userId) {
      throw new ForbiddenException('Only the circle owner or original sharer can remove shared notes');
    }

    await this.prisma.circleSharedNote.delete({ where: { id: sharedNote.id } });
    return { message: 'Shared note removed successfully' };
  }
}