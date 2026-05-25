import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import type { User } from '../../generated/prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

export interface PasswordChangeResponse {
  message: string;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly safeUserSelect = {
    id: true,
    name: true,
    email: true,
    gender: true,
    dob: true,
    mobileNumber: true,
    relationshipStatus: true,
    createdAt: true,
    updatedAt: true,
  } as const;

  async getMe(userId: string): Promise<Omit<User, 'password'>> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: this.safeUserSelect,
    });

    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }

    return user;
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<Omit<User, 'password'>> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }

    const savedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(updateProfileDto.name !== undefined ? { name: updateProfileDto.name } : {}),
        ...(updateProfileDto.gender !== undefined ? { gender: updateProfileDto.gender } : {}),
        ...(updateProfileDto.dob !== undefined ? { dob: new Date(updateProfileDto.dob) } : {}),
        ...(updateProfileDto.mobileNumber !== undefined
          ? { mobileNumber: updateProfileDto.mobileNumber }
          : {}),
        ...(updateProfileDto.relationshipStatus !== undefined
          ? { relationshipStatus: updateProfileDto.relationshipStatus }
          : {}),
      },
      select: this.safeUserSelect,
    });

    return savedUser;
  }

  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<PasswordChangeResponse> {
    if (changePasswordDto.newPassword !== changePasswordDto.confirmPassword) {
      throw new BadRequestException('New password and confirm password do not match');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        password: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: await bcrypt.hash(changePasswordDto.newPassword, 12) },
    });

    return { message: 'Password updated successfully' };
  }
}