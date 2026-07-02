import { Injectable } from '@nestjs/common';

import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFocusSessionDto } from './dto/create-focus-session.dto';
import { UpdateFocusSettingsDto } from './dto/update-focus-settings.dto';
import { FocusSession } from './entities/focus-session.entity';
import { FocusSettings } from './entities/focus-settings.entity';

@Injectable()
export class FocusService {
  constructor(private readonly prisma: PrismaService) {}

  async getSettings(currentUser: AuthenticatedUser): Promise<FocusSettings> {
    const existing = await this.prisma.focusSettings.findUnique({
      where: { userId: currentUser.userId },
    });

    if (existing) {
      return existing as FocusSettings;
    }

    const created = await this.prisma.focusSettings.create({
      data: { userId: currentUser.userId },
    });

    return created as FocusSettings;
  }

  async updateSettings(
    dto: UpdateFocusSettingsDto,
    currentUser: AuthenticatedUser,
  ): Promise<FocusSettings> {
    const updated = await this.prisma.focusSettings.upsert({
      where: { userId: currentUser.userId },
      create: {
        userId: currentUser.userId,
        ...dto,
      },
      update: dto,
    });

    return updated as FocusSettings;
  }

  async createSession(
    dto: CreateFocusSessionDto,
    currentUser: AuthenticatedUser,
  ): Promise<FocusSession> {
    const created = await this.prisma.focusSession.create({
      data: {
        userId: currentUser.userId,
        durationMinutes: dto.durationMinutes,
        label: dto.label ?? null,
        wasCompleted: dto.wasCompleted ?? false,
        completedAt: dto.wasCompleted ? new Date() : null,
      },
    });

    return created as FocusSession;
  }
}
