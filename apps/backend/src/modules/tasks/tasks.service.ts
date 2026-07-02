import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';

import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './entities/task.entity';

type TaskRecord = {
  id: string;
  title: string;
  description: string | null;
  dueDate: Date;
  priority: 'low' | 'medium' | 'high';
  isCompleted: boolean;
  tags: Prisma.JsonValue | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  private normalizeTags(tags: string[] | undefined): string[] {
    if (!tags) {
      return [];
    }

    return tags.map((tag) => tag.trim()).filter(Boolean);
  }

  private parseTags(tags: Prisma.JsonValue | null): string[] {
    if (!Array.isArray(tags)) {
      return [];
    }

    return tags.filter((tag): tag is string => typeof tag === 'string').map((tag) => tag.trim()).filter(Boolean);
  }

  private toTaskEntity(record: TaskRecord): Task {
    return {
      ...record,
      tags: this.parseTags(record.tags),
    };
  }

  async create(createTaskDto: CreateTaskDto, currentUser: AuthenticatedUser): Promise<Task> {
    const created = await this.prisma.task.create({
      data: {
        title: createTaskDto.title,
        description: createTaskDto.description ?? null,
        dueDate: new Date(createTaskDto.dueDate),
        priority: createTaskDto.priority,
        isCompleted: createTaskDto.isCompleted ?? false,
        tags: this.normalizeTags(createTaskDto.tags),
        userId: currentUser.userId,
      },
    });

    return this.toTaskEntity(created as TaskRecord);
  }

  async findAll(currentUser: AuthenticatedUser): Promise<Task[]> {
    const tasks = await this.prisma.task.findMany({
      where: { userId: currentUser.userId },
      orderBy: [{ isCompleted: 'asc' }, { dueDate: 'asc' }, { createdAt: 'desc' }],
    });

    return tasks.map((task) => this.toTaskEntity(task as TaskRecord));
  }

  async findOne(id: string, currentUser: AuthenticatedUser): Promise<Task> {
    const task = await this.prisma.task.findFirst({
      where: {
        id,
        userId: currentUser.userId,
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return this.toTaskEntity(task as TaskRecord);
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, currentUser: AuthenticatedUser): Promise<Task> {
    await this.findOne(id, currentUser);

    const updated = await this.prisma.task.update({
      where: { id },
      data: {
        ...(updateTaskDto.title !== undefined ? { title: updateTaskDto.title } : {}),
        ...(updateTaskDto.description !== undefined ? { description: updateTaskDto.description } : {}),
        ...(updateTaskDto.dueDate !== undefined ? { dueDate: new Date(updateTaskDto.dueDate) } : {}),
        ...(updateTaskDto.priority !== undefined ? { priority: updateTaskDto.priority } : {}),
        ...(updateTaskDto.isCompleted !== undefined ? { isCompleted: updateTaskDto.isCompleted } : {}),
        ...(updateTaskDto.tags !== undefined ? { tags: this.normalizeTags(updateTaskDto.tags) } : {}),
      },
    });

    return this.toTaskEntity(updated as TaskRecord);
  }

  async remove(id: string, currentUser: AuthenticatedUser): Promise<{ message: string }> {
    await this.findOne(id, currentUser);
    await this.prisma.task.delete({ where: { id } });

    return { message: 'Task deleted successfully' };
  }
}
