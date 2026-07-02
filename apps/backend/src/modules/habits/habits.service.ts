import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import { CheckInDto } from './dto/check-in.dto';
import { CreateHabitDto } from './dto/create-habit.dto';
import { UpdateHabitDto } from './dto/update-habit.dto';
import { HabitLog, HabitWithStats } from './entities/habit.entity';

// ─── Streak helpers ────────────────────────────────────────────────────────────

function toLocalDateString(date: Date): string {
  return date.toISOString().split('T')[0]; // 'YYYY-MM-DD'
}

function todayDateString(): string {
  return toLocalDateString(new Date());
}

/**
 * Compute current streak, longest streak, and total completions from
 * an array of log-date strings ('YYYY-MM-DD'), sorted ascending.
 */
function computeStreaks(sortedDates: string[]): {
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
} {
  const totalCompletions = sortedDates.length;

  if (totalCompletions === 0) {
    return { currentStreak: 0, longestStreak: 0, totalCompletions: 0 };
  }

  const today = todayDateString();
  const yesterday = toLocalDateString(new Date(Date.now() - 86_400_000));

  // Deduplicate just in case
  const unique = Array.from(new Set(sortedDates)).sort();

  // Longest streak — walk forward through unique dates
  let longestStreak = 1;
  let runLength = 1;
  for (let i = 1; i < unique.length; i++) {
    const prev = new Date(unique[i - 1]);
    const curr = new Date(unique[i]);
    const diffDays = Math.round((curr.getTime() - prev.getTime()) / 86_400_000);
    if (diffDays === 1) {
      runLength++;
      longestStreak = Math.max(longestStreak, runLength);
    } else {
      runLength = 1;
    }
  }

  // Current streak — walk backward from today
  const lastDate = unique[unique.length - 1];
  const streakStartsFrom = lastDate === today || lastDate === yesterday ? lastDate : null;

  if (!streakStartsFrom) {
    return { currentStreak: 0, longestStreak, totalCompletions };
  }

  let currentStreak = 1;
  for (let i = unique.length - 2; i >= 0; i--) {
    const next = new Date(unique[i + 1]);
    const curr = new Date(unique[i]);
    const diffDays = Math.round((next.getTime() - curr.getTime()) / 86_400_000);
    if (diffDays === 1) {
      currentStreak++;
    } else {
      break;
    }
  }

  return { currentStreak, longestStreak, totalCompletions };
}

// ─── Service ───────────────────────────────────────────────────────────────────

@Injectable()
export class HabitsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(currentUser: AuthenticatedUser): Promise<HabitWithStats[]> {
    const today = todayDateString();
    const thirtyDaysAgo = toLocalDateString(new Date(Date.now() - 30 * 86_400_000));

    const habits = await this.prisma.habit.findMany({
      where: { userId: currentUser.userId, isArchived: false },
      include: {
        logs: {
          where: {
            logDate: { gte: new Date(thirtyDaysAgo) },
          },
          orderBy: { logDate: 'asc' },
          select: { logDate: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return habits.map((habit) => {
      const sortedDates = habit.logs.map((l) => toLocalDateString(l.logDate));
      const { currentStreak, longestStreak, totalCompletions } = computeStreaks(sortedDates);
      const completedToday = sortedDates.includes(today);

      // Completion rate over last 30 days relative to frequency
      const daysWindow = 30;
      const targetDays =
        habit.frequency === 'daily'
          ? daysWindow
          : Math.round((daysWindow / 7) * habit.targetDaysPerWeek);
      const completionRate = Math.min(
        100,
        Math.round((totalCompletions / Math.max(1, targetDays)) * 100),
      );

      const { logs: _, ...habitBase } = habit;
      return {
        ...habitBase,
        frequency: habitBase.frequency as 'daily' | 'weekly',
        currentStreak,
        longestStreak,
        totalCompletions,
        completedToday,
        completionRate,
      };
    });
  }

  async findLogs(habitId: string, currentUser: AuthenticatedUser): Promise<HabitLog[]> {
    const habit = await this.prisma.habit.findFirst({
      where: { id: habitId, userId: currentUser.userId },
    });
    if (!habit) throw new NotFoundException('Habit not found');

    const logs = await this.prisma.habitLog.findMany({
      where: { habitId },
      orderBy: { logDate: 'asc' },
    });

    return logs.map((l) => ({
      ...l,
      logDate: l.logDate,
      note: l.note ?? null,
    }));
  }

  async create(dto: CreateHabitDto, currentUser: AuthenticatedUser): Promise<HabitWithStats> {
    const habit = await this.prisma.habit.create({
      data: {
        userId: currentUser.userId,
        name: dto.name,
        description: dto.description ?? null,
        color: dto.color ?? '#7c3aed',
        icon: dto.icon ?? '✨',
        frequency: dto.frequency ?? 'daily',
        targetDaysPerWeek: dto.targetDaysPerWeek ?? 7,
      },
    });

    return {
      ...habit,
      frequency: habit.frequency as 'daily' | 'weekly',
      currentStreak: 0,
      longestStreak: 0,
      totalCompletions: 0,
      completedToday: false,
      completionRate: 0,
    };
  }

  async update(
    habitId: string,
    dto: UpdateHabitDto,
    currentUser: AuthenticatedUser,
  ): Promise<HabitWithStats> {
    const existing = await this.prisma.habit.findFirst({
      where: { id: habitId, userId: currentUser.userId },
    });
    if (!existing) throw new NotFoundException('Habit not found');

    const updated = await this.prisma.habit.update({
      where: { id: habitId },
      data: {
        name: dto.name,
        description: dto.description,
        color: dto.color,
        icon: dto.icon,
        frequency: dto.frequency,
        targetDaysPerWeek: dto.targetDaysPerWeek,
        isArchived: dto.isArchived,
      },
    });

    // Re-fetch stats
    const [stats] = await this.findAll(currentUser);

    return {
      ...updated,
      frequency: updated.frequency as 'daily' | 'weekly',
      ...(stats?.id === habitId
        ? {
            currentStreak: stats.currentStreak,
            longestStreak: stats.longestStreak,
            totalCompletions: stats.totalCompletions,
            completedToday: stats.completedToday,
            completionRate: stats.completionRate,
          }
        : {
            currentStreak: 0,
            longestStreak: 0,
            totalCompletions: 0,
            completedToday: false,
            completionRate: 0,
          }),
    };
  }

  async remove(habitId: string, currentUser: AuthenticatedUser): Promise<{ message: string }> {
    const existing = await this.prisma.habit.findFirst({
      where: { id: habitId, userId: currentUser.userId },
    });
    if (!existing) throw new NotFoundException('Habit not found');

    await this.prisma.habit.delete({ where: { id: habitId } });
    return { message: 'Habit deleted successfully' };
  }

  async checkIn(
    habitId: string,
    dto: CheckInDto,
    currentUser: AuthenticatedUser,
  ): Promise<{ message: string; log: HabitLog }> {
    const habit = await this.prisma.habit.findFirst({
      where: { id: habitId, userId: currentUser.userId },
    });
    if (!habit) throw new NotFoundException('Habit not found');

    const today = todayDateString();
    const todayDate = new Date(today);

    const existing = await this.prisma.habitLog.findUnique({
      where: { habitId_logDate: { habitId, logDate: todayDate } },
    });
    if (existing) throw new ConflictException('Already checked in today');

    const log = await this.prisma.habitLog.create({
      data: {
        habitId,
        userId: currentUser.userId,
        logDate: todayDate,
        note: dto.note ?? null,
      },
    });

    return { message: 'Checked in successfully', log: { ...log, note: log.note ?? null } };
  }

  async undoCheckIn(
    habitId: string,
    currentUser: AuthenticatedUser,
  ): Promise<{ message: string }> {
    const habit = await this.prisma.habit.findFirst({
      where: { id: habitId, userId: currentUser.userId },
    });
    if (!habit) throw new NotFoundException('Habit not found');

    const today = todayDateString();
    const todayDate = new Date(today);

    const existing = await this.prisma.habitLog.findUnique({
      where: { habitId_logDate: { habitId, logDate: todayDate } },
    });
    if (!existing) throw new BadRequestException('No check-in found for today');

    await this.prisma.habitLog.delete({
      where: { habitId_logDate: { habitId, logDate: todayDate } },
    });

    return { message: 'Check-in removed' };
  }
}
