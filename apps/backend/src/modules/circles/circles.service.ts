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
import { Note } from '../notes/entities/note.entity';
import { CreateCircleDto } from './dto/create-circle.dto';
import { InviteCircleMemberDto } from './dto/invite-circle-member.dto';
import { ShareCircleNoteDto } from './dto/share-circle-note.dto';
import { CircleMember } from './entities/circle-member.entity';
import { CircleSharedNote } from './entities/circle-shared-note.entity';
import { Circle } from './entities/circle.entity';

@Injectable()
export class CirclesService {
  constructor(
    @InjectRepository(Circle)
    private readonly circlesRepository: Repository<Circle>,
    @InjectRepository(CircleMember)
    private readonly circleMembersRepository: Repository<CircleMember>,
    @InjectRepository(CircleSharedNote)
    private readonly circleSharedNotesRepository: Repository<CircleSharedNote>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Note)
    private readonly notesRepository: Repository<Note>,
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
      .innerJoin('circle_members', 'member', 'member.circleId = circle.id')
      .where('member.userId = :userId', { userId: currentUser.userId })
      .andWhere('member.status = :status', { status: 'accepted' })
      .orderBy('circle.updatedAt', 'DESC')
      .getMany();
  }

  async inviteMember(
    circleId: string,
    inviteDto: InviteCircleMemberDto,
    currentUser: AuthenticatedUser,
  ): Promise<CircleMember> {
    const circle = await this.ensureOwnedCircle(circleId, currentUser.userId);

    const invitee = await this.usersRepository.findOne({
      where: { email: inviteDto.email.toLowerCase() },
      select: { id: true, email: true, name: true },
    });

    if (!invitee) {
      throw new NotFoundException('User with this email was not found');
    }

    const existingMember = await this.circleMembersRepository.findOne({
      where: {
        circleId: circle.id,
        userId: invitee.id,
      },
    });

    if (existingMember) {
      existingMember.status = inviteDto.status ?? existingMember.status;
      return this.circleMembersRepository.save(existingMember);
    }

    const member = this.circleMembersRepository.create({
      circleId: circle.id,
      userId: invitee.id,
      role: 'member',
      status: inviteDto.status ?? 'invited',
    });

    return this.circleMembersRepository.save(member);
  }

  async getMembers(circleId: string, currentUser: AuthenticatedUser): Promise<CircleMember[]> {
    await this.ensureCircleAccessible(circleId, currentUser.userId);

    return this.circleMembersRepository.find({
      where: { circleId },
      order: { createdAt: 'ASC' },
    });
  }

  async shareNote(
    circleId: string,
    shareCircleNoteDto: ShareCircleNoteDto,
    currentUser: AuthenticatedUser,
  ): Promise<CircleSharedNote> {
    await this.ensureCircleAccessible(circleId, currentUser.userId);

    const note = await this.notesRepository.findOne({
      where: {
        id: shareCircleNoteDto.noteId,
        userId: currentUser.userId,
      },
      select: { id: true, userId: true, title: true, content: true },
    });

    if (!note) {
      throw new NotFoundException('Note not found for current user');
    }

    const existing = await this.circleSharedNotesRepository.findOne({
      where: {
        circleId,
        noteId: note.id,
      },
    });

    if (existing) {
      throw new BadRequestException('Note is already shared in this circle');
    }

    const sharedNote = this.circleSharedNotesRepository.create({
      circleId,
      noteId: note.id,
      sharedByUserId: currentUser.userId,
    });

    return this.circleSharedNotesRepository.save(sharedNote);
  }

  async getSharedNotes(circleId: string, currentUser: AuthenticatedUser): Promise<CircleSharedNote[]> {
    await this.ensureCircleAccessible(circleId, currentUser.userId);

    return this.circleSharedNotesRepository.find({
      where: { circleId },
      order: { createdAt: 'DESC' },
      relations: {
        note: true,
      },
    });
  }

  private async ensureOwnedCircle(circleId: string, userId: string): Promise<Circle> {
    const circle = await this.circlesRepository.findOne({
      where: {
        id: circleId,
        ownerId: userId,
      },
    });

    if (!circle) {
      throw new ForbiddenException('Only circle owner can perform this action');
    }

    return circle;
  }

  private async ensureCircleAccessible(circleId: string, userId: string): Promise<void> {
    const membership = await this.circleMembersRepository.findOne({
      where: {
        circleId,
        userId,
        status: 'accepted',
      },
    });

    if (!membership) {
      throw new ForbiddenException('You are not a member of this circle');
    }
  }
}
