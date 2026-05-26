import { Injectable, UnauthorizedException } from '@nestjs/common';

import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import {
  DashboardOverviewCircle,
  DashboardOverviewCircleMember,
  DashboardOverviewPlaylist,
  DashboardOverviewResponse,
} from './entities/dashboard-overview.entity';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  private mapTracksFromDb(tracks: string | null): string[] {
    if (!tracks) {
      return [];
    }

    return tracks
      .split(',')
      .map((track) => track.trim())
      .filter(Boolean);
  }

  async getOverview(currentUser: AuthenticatedUser): Promise<DashboardOverviewResponse> {
    const [
      me,
      notesCount,
      pendingRemindersCount,
      playlistsCount,
      recentNotes,
      upcomingReminders,
      membershipRows,
      quickPlayerPlaylistRow,
    ] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: currentUser.userId },
        select: { name: true },
      }),
      this.prisma.note.count({ where: { userId: currentUser.userId } }),
      this.prisma.reminder.count({
        where: {
          userId: currentUser.userId,
          isCompleted: 0,
        },
      }),
      this.prisma.playlist.count({ where: { userId: currentUser.userId } }),
      this.prisma.note.findMany({
        where: { userId: currentUser.userId },
        orderBy: { updatedAt: 'desc' },
        take: 8,
        select: {
          id: true,
          title: true,
          content: true,
          updatedAt: true,
        },
      }),
      this.prisma.reminder.findMany({
        where: {
          userId: currentUser.userId,
          isCompleted: 0,
        },
        orderBy: { remindAt: 'asc' },
        take: 4,
        select: {
          id: true,
          title: true,
          remindAt: true,
        },
      }),
      this.prisma.circleMember.findMany({
        where: { userId: currentUser.userId },
        select: { circleId: true },
      }),
      this.prisma.playlist.findFirst({
        where: { userId: currentUser.userId },
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true,
          name: true,
          tracks: true,
        },
      }),
    ]);

    if (!me) {
      throw new UnauthorizedException('User no longer exists');
    }

    const memberCircleIds = membershipRows.map((row) => row.circleId);
    const circleWhere = {
      OR: [
        { ownerId: currentUser.userId },
        ...(memberCircleIds.length > 0 ? [{ id: { in: memberCircleIds } }] : []),
      ],
    };

    const [activeCirclesCount, activeCircleRows] = await Promise.all([
      this.prisma.circle.count({ where: circleWhere }),
      this.prisma.circle.findMany({
        where: circleWhere,
        orderBy: { updatedAt: 'desc' },
        take: 4,
        select: {
          id: true,
          name: true,
        },
      }),
    ]);

    const activeCircleIds = activeCircleRows.map((circle) => circle.id);

    const acceptedMemberRows = activeCircleIds.length
      ? await this.prisma.circleMember.findMany({
          where: {
            circleId: { in: activeCircleIds },
            status: 'accepted',
          },
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            circleId: true,
            userId: true,
            role: true,
            status: true,
          },
        })
      : [];

    const acceptedUserIds = [...new Set(acceptedMemberRows.map((member) => member.userId))];
    const acceptedUsers = acceptedUserIds.length
      ? await this.prisma.user.findMany({
          where: { id: { in: acceptedUserIds } },
          select: {
            id: true,
            name: true,
            email: true,
          },
        })
      : [];

    const userById = new Map(acceptedUsers.map((user) => [user.id, user]));
    const membersByCircleId = new Map<string, DashboardOverviewCircleMember[]>();

    for (const member of acceptedMemberRows) {
      const bucket = membersByCircleId.get(member.circleId) ?? [];
      bucket.push({
        ...member,
        user: userById.get(member.userId),
      });
      membersByCircleId.set(member.circleId, bucket);
    }

    const activeCircles: DashboardOverviewCircle[] = activeCircleRows.map((circle) => ({
      id: circle.id,
      name: circle.name,
      members: membersByCircleId.get(circle.id) ?? [],
    }));

    const quickPlayerPlaylist: DashboardOverviewPlaylist | null = quickPlayerPlaylistRow
      ? {
          id: quickPlayerPlaylistRow.id,
          name: quickPlayerPlaylistRow.name,
          urls: this.mapTracksFromDb(quickPlayerPlaylistRow.tracks),
        }
      : null;

    return {
      me: { name: me.name },
      summary: {
        notesCount,
        pendingRemindersCount,
        activeCirclesCount,
        playlistsCount,
      },
      recentNotes,
      upcomingReminders,
      activeCircles,
      quickPlayerPlaylist,
    };
  }
}
