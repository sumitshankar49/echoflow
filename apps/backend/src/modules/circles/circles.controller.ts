import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import {
  AuthenticatedUser,
  CurrentUser,
} from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CirclesService } from './circles.service';
import { CreateCircleDto } from './dto/create-circle.dto';
import { InviteCircleMemberDto } from './dto/invite-circle-member.dto';
import { CircleMember } from './entities/circle-member.entity';
import { Circle } from './entities/circle.entity';

@ApiTags('Circles')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
@UseGuards(JwtAuthGuard)
@Controller('circles')
export class CirclesController {
  constructor(private readonly circlesService: CirclesService) {}

  @Get()
  @ApiOperation({ summary: 'Get circles for current user' })
  @ApiOkResponse({ description: 'Circles fetched successfully', type: Circle, isArray: true })
  findAll(@CurrentUser() currentUser: AuthenticatedUser): Promise<Circle[]> {
    return this.circlesService.findAll(currentUser);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new circle' })
  @ApiBody({ type: CreateCircleDto })
  @ApiCreatedResponse({ description: 'Circle created successfully', type: Circle })
  create(
    @Body() createCircleDto: CreateCircleDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<Circle> {
    return this.circlesService.create(createCircleDto, currentUser);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single circle by id' })
  @ApiParam({ name: 'id', description: 'Circle UUID' })
  @ApiOkResponse({ description: 'Circle fetched successfully', type: Circle })
  findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<Circle> {
    return this.circlesService.findOne(id, currentUser);
  }

  @Post(':id/invite')
  @ApiOperation({ summary: 'Invite a member to circle by email' })
  @ApiParam({ name: 'id', description: 'Circle UUID' })
  @ApiBody({ type: InviteCircleMemberDto })
  @ApiCreatedResponse({ description: 'Member invited successfully', type: CircleMember })
  inviteMember(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() inviteCircleMemberDto: InviteCircleMemberDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<CircleMember> {
    return this.circlesService.inviteMember(id, inviteCircleMemberDto, currentUser);
  }
}