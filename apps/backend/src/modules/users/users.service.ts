import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';

import { User } from '../../database/entities/user.entity';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

export interface PasswordChangeResponse {
  message: string;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async getMe(userId: string): Promise<Omit<User, 'password'>> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }

    const { password, ...safeUser } = user;
    return safeUser;
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<Omit<User, 'password'>> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }

    if (updateProfileDto.name !== undefined) {
      user.name = updateProfileDto.name;
    }
    if (updateProfileDto.gender !== undefined) {
      user.gender = updateProfileDto.gender;
    }
    if (updateProfileDto.dob !== undefined) {
      user.dob = new Date(updateProfileDto.dob);
    }
    if (updateProfileDto.mobileNumber !== undefined) {
      user.mobileNumber = updateProfileDto.mobileNumber;
    }
    if (updateProfileDto.relationshipStatus !== undefined) {
      user.relationshipStatus = updateProfileDto.relationshipStatus;
    }

    const savedUser = await this.usersRepository.save(user);
    const { password, ...safeUser } = savedUser;
    return safeUser;
  }

  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<PasswordChangeResponse> {
    if (changePasswordDto.newPassword !== changePasswordDto.confirmPassword) {
      throw new BadRequestException('New password and confirm password do not match');
    }

    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: {
        id: true,
        password: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }

    user.password = await bcrypt.hash(changePasswordDto.newPassword, 12);
    await this.usersRepository.save(user);

    return { message: 'Password updated successfully' };
  }
}