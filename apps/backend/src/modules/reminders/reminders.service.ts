import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { CreateReminderDto } from './dto/create-reminder.dto';
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
      expiresAt: new Date(createReminderDto.expiresAt),
      isCompleted: createReminderDto.isCompleted ?? false,
      userId: currentUser.userId,
    });

    return this.remindersRepository.save(reminder);
  }

  async findAll(currentUser: AuthenticatedUser): Promise<Reminder[]> {
    return this.remindersRepository.find({
      where: { userId: currentUser.userId },
      order: {
        expiresAt: 'ASC',
      },
    });
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
      expiresAt: updateReminderDto.expiresAt
        ? new Date(updateReminderDto.expiresAt)
        : reminder.expiresAt,
      description:
        updateReminderDto.description === undefined
          ? reminder.description
          : updateReminderDto.description,
    });

    return this.remindersRepository.save(updatedReminder);
  }

  async remove(id: string, currentUser: AuthenticatedUser): Promise<{ message: string }> {
    const reminder = await this.findOne(id, currentUser);
    await this.remindersRepository.remove(reminder);

    return { message: 'Reminder deleted successfully' };
  }
}
