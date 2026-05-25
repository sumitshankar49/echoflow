import { Injectable, NotFoundException } from '@nestjs/common';

import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { ReminderFilterDto } from './dto/reminder-filter.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';
import { Reminder } from './entities/reminder.entity';

@Injectable()
export class RemindersService {
  constructor(private readonly prisma: PrismaService) {}

  private toReminderEntity(record: {
    id: string;
    title: string;
    description: string | null;
    remindAt: Date;
    isCompleted: number;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
  }): Reminder {
    return {
      ...record,
      isCompleted: Boolean(record.isCompleted),
    };
  }

  async create(
    createReminderDto: CreateReminderDto,
    currentUser: AuthenticatedUser,
  ): Promise<Reminder> {
    const reminder = await this.prisma.reminder.create({
      data: {
        title: createReminderDto.title,
        description: createReminderDto.description ?? null,
        remindAt: new Date(createReminderDto.remindAt),
        isCompleted: createReminderDto.isCompleted ? 1 : 0,
        userId: currentUser.userId,
      },
    });

    return this.toReminderEntity(reminder);
  }

  async findAll(currentUser: AuthenticatedUser, filter?: ReminderFilterDto): Promise<PaginatedResponseDto<Reminder>> {
    const page = filter?.page ?? 1;
    const limit = filter?.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: {
      userId: string;
      isCompleted?: number;
      remindAt?: {
        gte?: Date;
        lt?: Date;
      };
    } = {
      userId: currentUser.userId,
    };

    if (filter?.isCompleted !== undefined) {
      where.isCompleted = filter.isCompleted ? 1 : 0;
    }

    if (filter?.from) {
      where.remindAt = {
        ...where.remindAt,
        gte: new Date(filter.from),
      };
    }

    if (filter?.to) {
      // Include the full end day by moving to the start of the next day
      const toDate = new Date(filter.to);
      toDate.setUTCDate(toDate.getUTCDate() + 1);
      where.remindAt = {
        ...where.remindAt,
        lt: toDate,
      };
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.reminder.findMany({
        where,
        orderBy: { remindAt: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.reminder.count({ where }),
    ]);

    return new PaginatedResponseDto(data.map((item) => this.toReminderEntity(item)), total, page, limit);
  }

  async findOne(id: string, currentUser: AuthenticatedUser): Promise<Reminder> {
    const reminder = await this.prisma.reminder.findFirst({
      where: { id, userId: currentUser.userId },
    });

    if (!reminder) {
      throw new NotFoundException('Reminder not found');
    }

    return this.toReminderEntity(reminder);
  }

  async update(
    id: string,
    updateReminderDto: UpdateReminderDto,
    currentUser: AuthenticatedUser,
  ): Promise<Reminder> {
    const existingReminder = await this.findOne(id, currentUser);

    const updatedReminder = await this.prisma.reminder.update({
      where: { id },
      data: {
        ...(updateReminderDto.title !== undefined ? { title: updateReminderDto.title } : {}),
        ...(updateReminderDto.description !== undefined
          ? { description: updateReminderDto.description }
          : {}),
        ...(updateReminderDto.remindAt !== undefined
          ? { remindAt: new Date(updateReminderDto.remindAt) }
          : { remindAt: existingReminder.remindAt }),
        ...(updateReminderDto.isCompleted !== undefined
          ? { isCompleted: updateReminderDto.isCompleted ? 1 : 0 }
          : {}),
      },
    });

    return this.toReminderEntity(updatedReminder);
  }

  async remove(id: string, currentUser: AuthenticatedUser): Promise<{ message: string }> {
    await this.findOne(id, currentUser);
    await this.prisma.reminder.delete({ where: { id } });

    return { message: 'Reminder deleted successfully' };
  }
}