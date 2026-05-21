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
import { ShareCircleNoteDto } from './dto/share-circle-note.dto';
import { CircleMember } from './entities/circle-member.entity';
import { CircleSharedNote } from './entities/circle-shared-note.entity';
import { Circle } from './entities/circle.entity';

@ApiTags('Circles')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
@UseGuards(JwtAuthGuard)
@Controller('circles')
export class CirclesController {
  constructor(private readonly circlesService: CirclesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new circle (family/shared group)' })
  @ApiBody({ type: CreateCircleDto })
  @ApiCreatedResponse({ description: 'Circle created successfully', type: Circle })
  create(
    @Body() createCircleDto: CreateCircleDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<Circle> {
    return this.circlesService.create(createCircleDto, currentUser);
  }

  @Get()
  @ApiOperation({ summary: 'Get circles for current user' })
  @ApiOkResponse({ description: 'Circles fetched successfully', type: Circle, isArray: true })
  findAll(@CurrentUser() currentUser: AuthenticatedUser): Promise<Circle[]> {
    return this.circlesService.findAll(currentUser);
  }

  @Post(':id/invite')
  @ApiOperation({ summary: 'Invite a member to circle by email' })
  @ApiParam({ name: 'id', description: 'Circle UUID' })
  @ApiBody({ type: InviteCircleMemberDto })
  @ApiCreatedResponse({ description: 'Member invited successfully', type: CircleMember })
  inviteMember(
    @Param('id', new ParseUUIDPipe()) circleId: string,
    @Body() inviteCircleMemberDto: InviteCircleMemberDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<CircleMember> {
    return this.circlesService.inviteMember(circleId, inviteCircleMemberDto, currentUser);
  }

  @Get(':id/members')
  @ApiOperation({ summary: 'Get circle members' })
  @ApiParam({ name: 'id', description: 'Circle UUID' })
  @ApiOkResponse({
    description: 'Circle members fetched successfully',
    type: CircleMember,
    isArray: true,
  })
  getMembers(
    @Param('id', new ParseUUIDPipe()) circleId: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<CircleMember[]> {
    return this.circlesService.getMembers(circleId, currentUser);
  }

  @Post(':id/shared-notes')
  @ApiOperation({ summary: 'Share a note in circle' })
  @ApiParam({ name: 'id', description: 'Circle UUID' })
  @ApiBody({ type: ShareCircleNoteDto })
  @ApiCreatedResponse({ description: 'Note shared successfully', type: CircleSharedNote })
  shareNote(
    @Param('id', new ParseUUIDPipe()) circleId: string,
    @Body() shareCircleNoteDto: ShareCircleNoteDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<CircleSharedNote> {
    return this.circlesService.shareNote(circleId, shareCircleNoteDto, currentUser);
  }

  @Get(':id/shared-notes')
  @ApiOperation({ summary: 'Get shared notes from circle' })
  @ApiParam({ name: 'id', description: 'Circle UUID' })
  @ApiOkResponse({
    description: 'Shared notes fetched successfully',
    type: CircleSharedNote,
    isArray: true,
  })
  getSharedNotes(
    @Param('id', new ParseUUIDPipe()) circleId: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<CircleSharedNote[]> {
    return this.circlesService.getSharedNotes(circleId, currentUser);
  }
}
