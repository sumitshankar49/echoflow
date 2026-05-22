import { Body, Controller, Get, HttpCode, HttpStatus, Patch, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import {
  AuthenticatedUser,
  CurrentUser,
} from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { User } from '../../database/entities/user.entity';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { PasswordChangeResponse, UsersService } from './users.service';

@ApiTags('Users')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiOkResponse({
    description: 'Current user profile',
    schema: {
      example: {
        id: 'b0525fae-31d6-4890-baed-caf96d2ff97a',
        name: 'Candy User',
        email: 'candy@example.com',
        createdAt: '2026-05-21T10:00:00.000Z',
        updatedAt: '2026-05-21T10:00:00.000Z',
      },
    },
  })
  getMe(@CurrentUser() currentUser: AuthenticatedUser): Promise<Omit<User, 'password'>> {
    return this.usersService.getMe(currentUser.userId);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiBody({ type: UpdateProfileDto })
  @ApiOkResponse({
    description: 'Profile updated successfully',
    schema: {
      example: {
        id: 'b0525fae-31d6-4890-baed-caf96d2ff97a',
        name: 'Updated Candy User',
        email: 'candy@example.com',
        createdAt: '2026-05-21T10:00:00.000Z',
        updatedAt: '2026-05-22T10:00:00.000Z',
      },
    },
  })
  updateProfile(
    @Body() updateProfileDto: UpdateProfileDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<Omit<User, 'password'>> {
    return this.usersService.updateProfile(currentUser.userId, updateProfileDto);
  }

  @Patch('me/password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change current user password' })
  @ApiBody({ type: ChangePasswordDto })
  @ApiOkResponse({
    description: 'Password updated successfully',
    schema: {
      example: {
        message: 'Password updated successfully',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Current password is incorrect or password confirmation does not match',
  })
  changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<PasswordChangeResponse> {
    return this.usersService.changePassword(currentUser.userId, changePasswordDto);
  }
}