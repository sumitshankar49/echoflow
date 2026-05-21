import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../database/entities/user.entity';
import { CreateCircleDto } from './dto/create-circle.dto';
import { InviteCircleMemberDto } from './dto/invite-circle-member.dto';
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

  async findAll(currentUser: AuthenticatedUser): Promise<Circle[]> {
    return this.circlesRepository
      .createQueryBuilder('circle')
      .leftJoin('circle.members', 'member')
      .where('circle.ownerId = :userId', { userId: currentUser.userId })
      .orWhere('member.userId = :userId', { userId: currentUser.userId })
      .orderBy('circle.updatedAt', 'DESC')
      .distinct(true)
      .getMany();
  }

  async findOne(id: string, currentUser: AuthenticatedUser): Promise<Circle> {
    const circle = await this.circlesRepository.findOne({
      where: { id },
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

  async inviteMember(
    circleId: string,
    inviteDto: InviteCircleMemberDto,
    currentUser: AuthenticatedUser,
  ): Promise<CircleMember> {
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
      throw new NotFoundException('User with this email was not found');
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