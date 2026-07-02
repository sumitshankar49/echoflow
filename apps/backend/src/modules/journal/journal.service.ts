import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';

import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateJournalDto } from './dto/create-journal.dto';
import { JournalFilterDto } from './dto/journal-filter.dto';
import { UpdateJournalDto } from './dto/update-journal.dto';
import { Journal } from './entities/journal.entity';

type JournalRecord = {
  id: string;
  title: string;
  content: string;
  mood: 'happy' | 'calm' | 'neutral' | 'anxious' | 'sad' | 'excited';
  tags: Prisma.JsonValue | null;
  date: Date;
  userId: string;
  createdAt: Date;
};

@Injectable()
export class JournalService {
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

  private toJournalEntity(record: JournalRecord): Journal {
    return {
      ...record,
      tags: this.parseTags(record.tags),
    };
  }

  async create(createJournalDto: CreateJournalDto, currentUser: AuthenticatedUser): Promise<Journal> {
    const created = await this.prisma.journal.create({
      data: {
        title: createJournalDto.title,
        content: createJournalDto.content,
        mood: createJournalDto.mood,
        tags: this.normalizeTags(createJournalDto.tags),
        date: new Date(createJournalDto.date),
        userId: currentUser.userId,
      },
    });

    return this.toJournalEntity(created as JournalRecord);
  }

  async findAll(currentUser: AuthenticatedUser, filter?: JournalFilterDto): Promise<Journal[]> {
    const where: {
      userId: string;
      mood?: 'happy' | 'calm' | 'neutral' | 'anxious' | 'sad' | 'excited';
      date?: {
        gte: Date;
        lt: Date;
      };
    } = {
      userId: currentUser.userId,
    };

    if (filter?.mood) {
      where.mood = filter.mood;
    }

    if (filter?.date) {
      const start = new Date(filter.date);
      const end = new Date(filter.date);
      end.setUTCDate(end.getUTCDate() + 1);
      where.date = { gte: start, lt: end };
    }

    const journals = await this.prisma.journal.findMany({
      where,
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
    });

    return journals.map((item) => this.toJournalEntity(item as JournalRecord));
  }

  async findOne(id: string, currentUser: AuthenticatedUser): Promise<Journal> {
    const journal = await this.prisma.journal.findFirst({
      where: {
        id,
        userId: currentUser.userId,
      },
    });

    if (!journal) {
      throw new NotFoundException('Journal entry not found');
    }

    return this.toJournalEntity(journal as JournalRecord);
  }

  async update(
    id: string,
    updateJournalDto: UpdateJournalDto,
    currentUser: AuthenticatedUser,
  ): Promise<Journal> {
    await this.findOne(id, currentUser);

    const updated = await this.prisma.journal.update({
      where: { id },
      data: {
        ...(updateJournalDto.title !== undefined ? { title: updateJournalDto.title } : {}),
        ...(updateJournalDto.content !== undefined ? { content: updateJournalDto.content } : {}),
        ...(updateJournalDto.mood !== undefined ? { mood: updateJournalDto.mood } : {}),
        ...(updateJournalDto.tags !== undefined ? { tags: this.normalizeTags(updateJournalDto.tags) } : {}),
        ...(updateJournalDto.date !== undefined ? { date: new Date(updateJournalDto.date) } : {}),
      },
    });

    return this.toJournalEntity(updated as JournalRecord);
  }

  async remove(id: string, currentUser: AuthenticatedUser): Promise<{ message: string }> {
    await this.findOne(id, currentUser);
    await this.prisma.journal.delete({ where: { id } });

    return { message: 'Journal entry deleted successfully' };
  }
}
