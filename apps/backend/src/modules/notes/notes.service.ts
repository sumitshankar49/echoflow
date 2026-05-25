import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';

import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { NoteFilterDto } from './dto/note-filter.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { Note } from './entities/note.entity';

@Injectable()
export class NotesService {
  constructor(private readonly prisma: PrismaService) {}

  private mapTagsFromDb(tags: string | null): string[] | null {
    if (!tags) {
      return null;
    }

    const parsed = tags.split(',').map((tag) => tag.trim()).filter(Boolean);
    return parsed.length > 0 ? parsed : null;
  }

  private mapTagsToDb(tags: string[] | undefined): string | null | undefined {
    if (tags === undefined) {
      return undefined;
    }

    const normalized = tags.map((tag) => tag.trim()).filter(Boolean);
    return normalized.length > 0 ? normalized.join(',') : null;
  }

  private toNoteEntity(record: {
    id: string;
    title: string;
    content: string;
    voiceUrl: string | null;
    tags: string | null;
    isFavorite: number;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
  }): Note {
    return {
      ...record,
      tags: this.mapTagsFromDb(record.tags),
      isFavorite: Boolean(record.isFavorite),
    };
  }

  async create(createNoteDto: CreateNoteDto, currentUser: AuthenticatedUser): Promise<Note> {
    const created = await this.prisma.note.create({
      data: {
        title: createNoteDto.title,
        content: createNoteDto.content,
        voiceUrl: createNoteDto.voiceUrl ?? null,
        tags: this.mapTagsToDb(createNoteDto.tags) ?? null,
        isFavorite: createNoteDto.isFavorite ? 1 : 0,
        userId: currentUser.userId,
      },
    });

    return this.toNoteEntity(created);
  }

  async findAll(currentUser: AuthenticatedUser, filter?: NoteFilterDto): Promise<PaginatedResponseDto<Note>> {
    const page = filter?.page ?? 1;
    const limit = filter?.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.NoteWhereInput = {
      userId: currentUser.userId,
      ...(filter?.isFavorite !== undefined ? { isFavorite: filter.isFavorite ? 1 : 0 } : {}),
    };

    let data: Awaited<ReturnType<typeof this.prisma.note.findMany>>;
    let total: number;

    if (filter?.tag?.trim()) {
      const trimmedTag = filter.tag.trim();
      data = await this.prisma.$queryRaw<
        {
          id: string;
          title: string;
          content: string;
          voiceUrl: string | null;
          tags: string | null;
          isFavorite: number;
          userId: string;
          createdAt: Date;
          updatedAt: Date;
        }[]
      >(
        Prisma.sql`
          SELECT id, title, content, voiceUrl, tags, isFavorite, userId, createdAt, updatedAt
          FROM notes
          WHERE userId = ${currentUser.userId}
            ${filter?.isFavorite !== undefined ? Prisma.sql`AND isFavorite = ${filter.isFavorite ? 1 : 0}` : Prisma.empty}
            AND FIND_IN_SET(${trimmedTag}, tags) > 0
          ORDER BY updatedAt DESC
          LIMIT ${limit} OFFSET ${skip}
        `,
      );

      const countRows = await this.prisma.$queryRaw<{ total: bigint | number }[]>(
        Prisma.sql`
          SELECT COUNT(*) AS total
          FROM notes
          WHERE userId = ${currentUser.userId}
            ${filter?.isFavorite !== undefined ? Prisma.sql`AND isFavorite = ${filter.isFavorite ? 1 : 0}` : Prisma.empty}
            AND FIND_IN_SET(${trimmedTag}, tags) > 0
        `,
      );
      const rawTotal = countRows[0]?.total ?? 0;
      total = Number(rawTotal);
    } else {
      [data, total] = await this.prisma.$transaction([
        this.prisma.note.findMany({
          where,
          orderBy: { updatedAt: 'desc' },
          skip,
          take: limit,
        }),
        this.prisma.note.count({ where }),
      ]);
    }

    return new PaginatedResponseDto(data.map((item) => this.toNoteEntity(item)), total, page, limit);
  }

  async search(query: string, currentUser: AuthenticatedUser): Promise<Note[]> {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      const notes = await this.prisma.note.findMany({
        where: { userId: currentUser.userId },
        orderBy: { updatedAt: 'desc' },
      });

      return notes.map((item) => this.toNoteEntity(item));
    }

    const notes = await this.prisma.note.findMany({
      where: {
        userId: currentUser.userId,
        OR: [
          {
            title: {
              contains: normalizedQuery,
            },
          },
          {
            content: {
              contains: normalizedQuery,
            },
          },
        ],
      },
      orderBy: { updatedAt: 'desc' },
    });

    return notes.map((item) => this.toNoteEntity(item));
  }

  async findOne(id: string, currentUser: AuthenticatedUser): Promise<Note> {
    const note = await this.prisma.note.findFirst({
      where: { id, userId: currentUser.userId },
    });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    return this.toNoteEntity(note);
  }

  async update(
    id: string,
    updateNoteDto: UpdateNoteDto,
    currentUser: AuthenticatedUser,
  ): Promise<Note> {
    await this.findOne(id, currentUser);

    const updatedNote = await this.prisma.note.update({
      where: { id },
      data: {
        ...(updateNoteDto.title !== undefined ? { title: updateNoteDto.title } : {}),
        ...(updateNoteDto.content !== undefined ? { content: updateNoteDto.content } : {}),
        ...(updateNoteDto.voiceUrl !== undefined ? { voiceUrl: updateNoteDto.voiceUrl } : {}),
        ...(updateNoteDto.isFavorite !== undefined
          ? { isFavorite: updateNoteDto.isFavorite ? 1 : 0 }
          : {}),
        ...(updateNoteDto.tags !== undefined ? { tags: this.mapTagsToDb(updateNoteDto.tags) } : {}),
      },
    });

    return this.toNoteEntity(updatedNote);
  }

  async remove(id: string, currentUser: AuthenticatedUser): Promise<{ message: string }> {
    await this.findOne(id, currentUser);
    await this.prisma.note.delete({ where: { id } });

    return { message: 'Note deleted successfully' };
  }
}
