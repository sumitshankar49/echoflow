import { Injectable } from '@nestjs/common';

import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CurrentMoodDto,
  MoodPointDto,
  TodayMoodResponseDto,
} from './dto/today-mood-response.dto';

@Injectable()
export class MoodService {
  constructor(private readonly prisma: PrismaService) {}

  async getTodayMood(currentUser: AuthenticatedUser): Promise<TodayMoodResponseDto> {
    const now = new Date();
    const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const todayEnd = new Date(todayStart);
    todayEnd.setUTCDate(todayEnd.getUTCDate() + 1);

    const trendStart = new Date(todayStart);
    trendStart.setUTCDate(trendStart.getUTCDate() - 6);

    const [todayMoodRecord, trendRecords] = await Promise.all([
      this.prisma.mood.findFirst({
        where: {
          userId: currentUser.userId,
          recordedAt: {
            gte: todayStart,
            lt: todayEnd,
          },
        },
        orderBy: { recordedAt: 'desc' },
      }),
      this.prisma.mood.findMany({
        where: {
          userId: currentUser.userId,
          recordedAt: {
            gte: trendStart,
            lt: todayEnd,
          },
        },
        orderBy: { recordedAt: 'desc' },
      }),
    ]);

    const latestMoodByDate = new Map<string, string>();
    for (const record of trendRecords) {
      const dateKey = record.recordedAt.toISOString().slice(0, 10);
      if (!latestMoodByDate.has(dateKey)) {
        latestMoodByDate.set(dateKey, record.mood);
      }
    }

    const trend: MoodPointDto[] = [];
    for (let offset = 6; offset >= 0; offset -= 1) {
      const date = new Date(todayStart);
      date.setUTCDate(date.getUTCDate() - offset);
      const dateKey = date.toISOString().slice(0, 10);

      trend.push({
        date: dateKey,
        mood: latestMoodByDate.get(dateKey) ?? null,
      });
    }

    const currentMood: CurrentMoodDto = {
      mood: todayMoodRecord?.mood ?? null,
      recordedAt: todayMoodRecord?.recordedAt ?? null,
    };

    return {
      currentMood,
      trend,
    };
  }
}
