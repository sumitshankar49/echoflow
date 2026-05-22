import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { ReminderFilterDto } from './dto/reminder-filter.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';
import { Reminder } from './entities/reminder.entity';

@Injectable()
export class RemindersService {
  constructor(
    @InjectRepository(Reminder)
    private readonly remindersRepository: Repository<Reminder>,
  ) {}

  async create(
    createReminderDto: CreateReminderDto,
    currentUser: AuthenticatedUser,
  ): Promise<Reminder> {
    const reminder = this.remindersRepository.create({
      title: createReminderDto.title,
      description: createReminderDto.description ?? null,
      remindAt: new Date(createReminderDto.remindAt),
      isCompleted: createReminderDto.isCompleted ?? false,
      userId: currentUser.userId,
    });

    return this.remindersRepository.save(reminder);
  }

  async findAll(currentUser: AuthenticatedUser, filter?: ReminderFilterDto): Promise<PaginatedResponseDto<Reminder>> {
    const page = filter?.page ?? 1;
    const limit = filter?.limit ?? 20;
    const skip = (page - 1) * limit;

    const qb = this.remindersRepository
      .createQueryBuilder('reminder')
      .where('reminder.userId = :userId', { userId: currentUser.userId });

    if (filter?.isCompleted !== undefined) {
      qb.andWhere('reminder.isCompleted = :isCompleted', { isCompleted: filter.isCompleted });
    }

    if (filter?.from) {
      qb.andWhere('reminder.remindAt >= :from', { from: new Date(filter.from) });
    }

    if (filter?.to) {
      // Include the full end day by moving to the start of the next day
      const toDate = new Date(filter.to);
      toDate.setUTCDate(toDate.getUTCDate() + 1);
      qb.andWhere('reminder.remindAt < :to', { to: toDate });
    }

    const [data, total] = await qb
      .orderBy('reminder.remindAt', 'ASC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return new PaginatedResponseDto(data, total, page, limit);
  }

  async findOne(id: string, currentUser: AuthenticatedUser): Promise<Reminder> {
    const reminder = await this.remindersRepository.findOne({
      where: {
        id,
        userId: currentUser.userId,
      },
    });

    if (!reminder) {
      throw new NotFoundException('Reminder not found');
    }

    return reminder;
  }

  async update(
    id: string,
    updateReminderDto: UpdateReminderDto,
    currentUser: AuthenticatedUser,
  ): Promise<Reminder> {
    const reminder = await this.findOne(id, currentUser);

    const updatedReminder = this.remindersRepository.merge(reminder, {
      ...updateReminderDto,
      remindAt: updateReminderDto.remindAt ? new Date(updateReminderDto.remindAt) : reminder.remindAt,
    });

    return this.remindersRepository.save(updatedReminder);
  }

  async remove(id: string, currentUser: AuthenticatedUser): Promise<{ message: string }> {
    const reminder = await this.findOne(id, currentUser);
    await this.remindersRepository.remove(reminder);

    return { message: 'Reminder deleted successfully' };
  }
}