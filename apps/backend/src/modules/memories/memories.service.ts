import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';

import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { MemoryFilterDto } from './dto/memory-filter.dto';
import { Memory } from './entities/memory.entity';

type MemoryRecord = {
  id: string;
  title: string;
  content: string;
  sourceType: 'note' | 'journal' | 'task';
  sourceId: string | null;
  tags: Prisma.JsonValue | null;
  importanceScore: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class MemoriesService {
  constructor(private readonly prisma: PrismaService) {}

  private parseTags(tags: Prisma.JsonValue | null): string[] {
    if (!Array.isArray(tags)) {
      return [];
    }

    return tags
      .filter((tag): tag is string => typeof tag === 'string')
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  private toEntity(record: MemoryRecord): Memory {
    return {
      ...record,
      tags: this.parseTags(record.tags),
    };
  }

  async findAll(
    currentUser: AuthenticatedUser,
    filter: MemoryFilterDto,
  ): Promise<PaginatedResponseDto<Memory>> {
    const page = filter.page ?? 1;
    const limit = filter.limit ?? 20;
    const skip = (page - 1) * limit;
    const normalizedFilter = filter.filter?.trim();

    let memories: MemoryRecord[];
    let total: number;

    if (normalizedFilter) {
      const escapedFilter = normalizedFilter.replace(/[%_]/g, '\\$&');
      const likePattern = `%${escapedFilter}%`;

      // Use raw SQL for JSON tag filtering to keep tags as true string[] in DB.
      memories = await this.prisma.$queryRaw<MemoryRecord[]>(Prisma.sql`
        SELECT id, title, content, sourceType, sourceId, tags, importanceScore, userId, createdAt, updatedAt
        FROM memories
        WHERE userId = ${currentUser.userId}
          AND (
            title LIKE ${likePattern}
            OR content LIKE ${likePattern}
            OR sourceType LIKE ${likePattern}
            OR JSON_SEARCH(tags, 'one', ${normalizedFilter}) IS NOT NULL
          )
        ORDER BY importanceScore DESC, updatedAt DESC
        LIMIT ${limit} OFFSET ${skip}
      `);

      const countRows = await this.prisma.$queryRaw<{ total: bigint | number }[]>(Prisma.sql`
        SELECT COUNT(*) AS total
        FROM memories
        WHERE userId = ${currentUser.userId}
          AND (
            title LIKE ${likePattern}
            OR content LIKE ${likePattern}
            OR sourceType LIKE ${likePattern}
            OR JSON_SEARCH(tags, 'one', ${normalizedFilter}) IS NOT NULL
          )
      `);
      total = Number(countRows[0]?.total ?? 0);
    } else {
      memories = await this.prisma.$queryRaw<MemoryRecord[]>(Prisma.sql`
        SELECT id, title, content, sourceType, sourceId, tags, importanceScore, userId, createdAt, updatedAt
        FROM memories
        WHERE userId = ${currentUser.userId}
        ORDER BY importanceScore DESC, updatedAt DESC
        LIMIT ${limit} OFFSET ${skip}
      `);

      const countRows = await this.prisma.$queryRaw<{ total: bigint | number }[]>(Prisma.sql`
        SELECT COUNT(*) AS total
        FROM memories
        WHERE userId = ${currentUser.userId}
      `);
      total = Number(countRows[0]?.total ?? 0);
    }

    return new PaginatedResponseDto(memories.map((memory) => this.toEntity(memory)), total, page, limit);
  }

  async search(query: string, currentUser: AuthenticatedUser): Promise<Memory[]> {
    const normalizedQuery = query.trim();

    if (!normalizedQuery) {
      const recent = await this.prisma.$queryRaw<MemoryRecord[]>(Prisma.sql`
        SELECT id, title, content, sourceType, sourceId, tags, importanceScore, userId, createdAt, updatedAt
        FROM memories
        WHERE userId = ${currentUser.userId}
        ORDER BY importanceScore DESC, updatedAt DESC
        LIMIT 20
      `);

      return recent.map((memory) => this.toEntity(memory));
    }

    const escapedQuery = normalizedQuery.replace(/[%_]/g, '\\$&');
    const booleanQuery = normalizedQuery
      .split(/\s+/)
      .map((word) => word.replace(/[+\-<>~*"@()]/g, '').trim())
      .filter((word) => word.length > 1)
      .map((word) => `+${word}*`)
      .join(' ');

    const likePattern = `%${escapedQuery}%`;

    // Full-text relevance is used first, with LIKE/JSON tag matching fallback.
    const rows = await this.prisma.$queryRaw<(MemoryRecord & { relevance: number })[]>(Prisma.sql`
      SELECT
        id,
        title,
        content,
        sourceType,
        sourceId,
        tags,
        importanceScore,
        userId,
        createdAt,
        updatedAt,
        CASE
          WHEN ${booleanQuery} <> '' THEN MATCH(title, content) AGAINST(${booleanQuery} IN BOOLEAN MODE)
          ELSE 0
        END AS relevance
      FROM memories
      WHERE userId = ${currentUser.userId}
        AND (
          (${booleanQuery} <> '' AND MATCH(title, content) AGAINST(${booleanQuery} IN BOOLEAN MODE))
          OR title LIKE ${likePattern}
          OR content LIKE ${likePattern}
          OR sourceType LIKE ${likePattern}
          OR JSON_SEARCH(tags, 'one', ${normalizedQuery}) IS NOT NULL
        )
      ORDER BY relevance DESC, importanceScore DESC, updatedAt DESC
      LIMIT 50
    `);

    return rows.map(({ relevance: _relevance, ...memory }) => this.toEntity(memory));
  }

  async findOne(id: string, currentUser: AuthenticatedUser): Promise<Memory> {
    const rows = await this.prisma.$queryRaw<MemoryRecord[]>(Prisma.sql`
      SELECT id, title, content, sourceType, sourceId, tags, importanceScore, userId, createdAt, updatedAt
      FROM memories
      WHERE id = ${id} AND userId = ${currentUser.userId}
      LIMIT 1
    `);
    const memory = rows[0];

    if (!memory) {
      throw new NotFoundException('Memory not found');
    }

    return this.toEntity(memory);
  }
}
