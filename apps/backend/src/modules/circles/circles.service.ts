import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { User } from '../../database/entities/user.entity';
import { MailService } from '../mail/mail.service';
import { CreateCircleDto } from './dto/create-circle.dto';
import { InviteCircleMemberDto } from './dto/invite-circle-member.dto';
import { UpdateCircleDto } from './dto/update-circle.dto';
import { CircleMember } from './entities/circle-member.entity';
import { Circle } from './entities/circle.entity';

@Injectable()
export class CirclesService {
  constructor(
    @InjectRepository(Circle)
    private readonly circlesRepository: Repository<Circle>,
    @InjectRepository(CircleMember)
    private readonly circleMembersRepository: Repository<CircleMember>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  async create(createCircleDto: CreateCircleDto, currentUser: AuthenticatedUser): Promise<Circle> {
    const circle = this.circlesRepository.create({
      name: createCircleDto.name,
      description: createCircleDto.description ?? null,
      ownerId: currentUser.userId,
    });

    const savedCircle = await this.circlesRepository.save(circle);

    const ownerMembership = this.circleMembersRepository.create({
      circleId: savedCircle.id,
      userId: currentUser.userId,
      role: 'owner',
      status: 'accepted',
    });

    await this.circleMembersRepository.save(ownerMembership);
    return savedCircle;
  }

  async findAll(currentUser: AuthenticatedUser, pagination?: PaginationQueryDto): Promise<PaginatedResponseDto<Circle>> {
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 20;
    const skip = (page - 1) * limit;

    const [data, total] = await this.circlesRepository.findAndCount({
      where: [
        { ownerId: currentUser.userId },
        { members: { userId: currentUser.userId } },
      ],
      relations: {
        members: {
          user: true,
        },
      },
      order: { updatedAt: 'DESC' },
      skip,
      take: limit,
    });

    return new PaginatedResponseDto(data, total, page, limit);
  }

  async findOne(id: string, currentUser: AuthenticatedUser): Promise<Circle> {
    const circle = await this.circlesRepository.findOne({
      where: { id },
      relations: {
        members: {
          user: true,
        },
      },
    });

    if (!circle) {
      throw new NotFoundException('Circle not found');
    }

    const membership = await this.circleMembersRepository.findOne({
      where: {
        circleId: id,
        userId: currentUser.userId,
      },
    });

    if (!membership && circle.ownerId !== currentUser.userId) {
      throw new ForbiddenException('You do not have access to this circle');
    }

    return circle;
  }

  async update(
    id: string,
    updateCircleDto: UpdateCircleDto,
    currentUser: AuthenticatedUser,
  ): Promise<Circle> {
    const circle = await this.circlesRepository.findOne({ where: { id } });

    if (!circle) {
      throw new NotFoundException('Circle not found');
    }

    if (circle.ownerId !== currentUser.userId) {
      throw new ForbiddenException('Only the circle owner can update this circle');
    }

    const updatedCircle = this.circlesRepository.merge(circle, {
      name: updateCircleDto.name ?? circle.name,
      description: updateCircleDto.description !== undefined ? updateCircleDto.description : circle.description,
    });

    return this.circlesRepository.save(updatedCircle);
  }

  async remove(id: string, currentUser: AuthenticatedUser): Promise<{ message: string }> {
    const circle = await this.circlesRepository.findOne({ where: { id } });

    if (!circle) {
      throw new NotFoundException('Circle not found');
    }

    if (circle.ownerId !== currentUser.userId) {
      throw new ForbiddenException('Only the circle owner can delete this circle');
    }

    await this.circlesRepository.remove(circle);

    return { message: 'Circle deleted successfully' };
  }

  async acceptInvitation(circleId: string, currentUser: AuthenticatedUser): Promise<CircleMember> {
    const membership = await this.circleMembersRepository.findOne({
      where: { circleId, userId: currentUser.userId },
    });

    if (!membership) {
      throw new NotFoundException('No invitation found for this circle');
    }

    membership.status = 'accepted';
    return this.circleMembersRepository.save(membership);
  }

  async declineInvitation(circleId: string, currentUser: AuthenticatedUser): Promise<{ message: string }> {
    const membership = await this.circleMembersRepository.findOne({
      where: { circleId, userId: currentUser.userId },
    });

    if (!membership) {
      throw new NotFoundException('No invitation found for this circle');
    }

    await this.circleMembersRepository.remove(membership);
    return { message: 'Invitation declined' };
  }

  async removeMember(
    circleId: string,
    memberId: string,
    currentUser: AuthenticatedUser,
  ): Promise<{ message: string }> {
    const circle = await this.circlesRepository.findOne({ where: { id: circleId } });

    if (!circle) {
      throw new NotFoundException('Circle not found');
    }

    if (circle.ownerId !== currentUser.userId) {
      throw new ForbiddenException('Only the circle owner can remove members');
    }

    const membership = await this.circleMembersRepository.findOne({
      where: { id: memberId, circleId },
    });

    if (!membership) {
      throw new NotFoundException('Member not found in this circle');
    }

    if (membership.userId === currentUser.userId) {
      throw new BadRequestException('Owner cannot remove themselves from the circle');
    }

    await this.circleMembersRepository.remove(membership);
    return { message: 'Member removed successfully' };
  }

  async leaveCircle(circleId: string, currentUser: AuthenticatedUser): Promise<{ message: string }> {
    const circle = await this.circlesRepository.findOne({ where: { id: circleId } });

    if (!circle) {
      throw new NotFoundException('Circle not found');
    }

    if (circle.ownerId === currentUser.userId) {
      throw new BadRequestException('Circle owner cannot leave; delete the circle instead');
    }

    const membership = await this.circleMembersRepository.findOne({
      where: { circleId, userId: currentUser.userId },
    });

    if (!membership) {
      throw new NotFoundException('You are not a member of this circle');
    }

    await this.circleMembersRepository.remove(membership);
    return { message: 'You have left the circle' };
  }

  async inviteMember(
    circleId: string,
    inviteDto: InviteCircleMemberDto,
    currentUser: AuthenticatedUser,
  ): Promise<CircleMember | { message: string }> {
    const circle = await this.circlesRepository.findOne({
      where: {
        id: circleId,
      },
    });

    if (!circle) {
      throw new NotFoundException('Circle not found');
    }

    if (circle.ownerId !== currentUser.userId) {
      throw new ForbiddenException('Only circle owner can invite members');
    }

    const invitee = await this.usersRepository.findOne({
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

    const existingMember = await this.circleMembersRepository.findOne({
      where: {
        circleId,
        userId: invitee.id,
      },
    });

    if (existingMember) {
      throw new BadRequestException('User is already part of this circle');
    }

    const member = this.circleMembersRepository.create({
      circleId,
      userId: invitee.id,
      role: 'member',
      status: 'invited',
    });

    return this.circleMembersRepository.save(member);
  }
}