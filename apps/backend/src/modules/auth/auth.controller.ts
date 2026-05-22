import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

import { AuthService } from './auth.service';
import type { LogoutResponse, TokenResponse } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { User } from '../../database/entities/user.entity';
import {
  AuthenticatedUser,
  CurrentUser,
} from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get current authenticated user profile' })
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
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  getMe(@CurrentUser() currentUser: AuthenticatedUser): Promise<Omit<User, 'password'>> {
    return this.authService.getMe(currentUser.userId);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new account' })
  @ApiBody({ type: RegisterDto })
  @ApiCreatedResponse({
    description: 'Account created successfully',
    schema: {
      example: {
        id: 'b0525fae-31d6-4890-baed-caf96d2ff97a',
        name: 'User',
        email: 'user@example.com',
        createdAt: '2026-05-21T10:00:00.000Z',
        updatedAt: '2026-05-21T10:00:00.000Z',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Validation failed or email already exists',
  })
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  register(@Body() registerDto: RegisterDto): Promise<Omit<User, 'password'>> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate user and issue tokens' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Authentication successful',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.access.token',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh.token',
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  login(@Body() loginDto: LoginDto): Promise<TokenResponse> {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access and refresh tokens' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tokens refreshed successfully',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.new.access.token',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.new.refresh.token',
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Invalid refresh token' })
  refresh(@Body() refreshTokenDto: RefreshTokenDto): Promise<TokenResponse> {
    return this.authService.refreshTokens(refreshTokenDto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout user session' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Logout successful',
    schema: {
      example: {
        message: 'Logged out successfully',
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Invalid refresh token' })
  logout(@Body() refreshTokenDto: RefreshTokenDto): Promise<LogoutResponse> {
    return this.authService.logout(refreshTokenDto);
  }
}
