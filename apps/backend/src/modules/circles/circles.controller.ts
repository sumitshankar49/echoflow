import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
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
import { UpdateCircleDto } from './dto/update-circle.dto';
import { CircleMember } from './entities/circle-member.entity';
import { Circle } from './entities/circle.entity';
import { CircleSharedNoteEntity } from './entities/circle-shared-note.entity';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@ApiTags('Circles')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
@UseGuards(JwtAuthGuard)
@Controller('circles')
export class CirclesController {
  constructor(private readonly circlesService: CirclesService) {}

  @Get()
  @ApiOperation({ summary: 'Get circles for current user' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (max 100)', example: 20 })
  @ApiOkResponse({
    description: 'Paginated circles',
    schema: { example: { data: [], total: 0, page: 1, totalPages: 0 } },
  })
  findAll(
    @Query() pagination: PaginationQueryDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<PaginatedResponseDto<Circle>> {
    return this.circlesService.findAll(currentUser, pagination);
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

  @Patch(':id')
  @ApiOperation({ summary: 'Update circle name or description' })
  @ApiParam({ name: 'id', description: 'Circle UUID' })
  @ApiBody({ type: UpdateCircleDto })
  @ApiOkResponse({ description: 'Circle updated successfully', type: Circle })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateCircleDto: UpdateCircleDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<Circle> {
    return this.circlesService.update(id, updateCircleDto, currentUser);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a circle by id' })
  @ApiParam({ name: 'id', description: 'Circle UUID' })
  @ApiOkResponse({
    description: 'Circle deleted successfully',
    schema: { example: { message: 'Circle deleted successfully' } },
  })
  remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<{ message: string }> {
    return this.circlesService.remove(id, currentUser);
  }

  @Patch(':id/invitations/accept')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Accept an invitation to a circle' })
  @ApiParam({ name: 'id', description: 'Circle UUID' })
  @ApiOkResponse({ description: 'Invitation accepted', type: CircleMember })
  acceptInvitation(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<CircleMember> {
    return this.circlesService.acceptInvitation(id, currentUser);
  }

  @Patch(':id/invitations/decline')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Decline an invitation to a circle' })
  @ApiParam({ name: 'id', description: 'Circle UUID' })
  @ApiOkResponse({
    description: 'Invitation declined',
    schema: { example: { message: 'Invitation declined' } },
  })
  declineInvitation(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<{ message: string }> {
    return this.circlesService.declineInvitation(id, currentUser);
  }

  @Delete(':id/members/:memberId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove a member from a circle (owner only)' })
  @ApiParam({ name: 'id', description: 'Circle UUID' })
  @ApiParam({ name: 'memberId', description: 'CircleMember UUID' })
  @ApiOkResponse({
    description: 'Member removed successfully',
    schema: { example: { message: 'Member removed successfully' } },
  })
  removeMember(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('memberId', new ParseUUIDPipe()) memberId: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<{ message: string }> {
    return this.circlesService.removeMember(id, memberId, currentUser);
  }

  @Post(':id/leave')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Leave a circle (non-owner members only)' })
  @ApiParam({ name: 'id', description: 'Circle UUID' })
  @ApiOkResponse({
    description: 'Left the circle successfully',
    schema: { example: { message: 'You have left the circle' } },
  })
  leaveCircle(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<{ message: string }> {
    return this.circlesService.leaveCircle(id, currentUser);
  }

  @Post(':id/invite')
  @ApiOperation({ summary: 'Invite a member to circle by email' })
  @ApiParam({ name: 'id', description: 'Circle UUID' })
  @ApiBody({ type: InviteCircleMemberDto })
  @ApiCreatedResponse({ description: 'Member invited successfully', type: CircleMember })
  @ApiOkResponse({
    description: 'Invite link guidance returned when account does not exist',
    schema: {
      example: {
        message:
          'No account found for this email yet. Share the invite link so they can join after sign up.',
      },
    },
  })
  inviteMember(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() inviteCircleMemberDto: InviteCircleMemberDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<CircleMember | { message: string }> {
    return this.circlesService.inviteMember(id, inviteCircleMemberDto, currentUser);
  }

  @Get(':id/shared-notes')
  @ApiOperation({ summary: 'Get real notes shared into a circle' })
  @ApiParam({ name: 'id', description: 'Circle UUID' })
  @ApiOkResponse({ description: 'Shared notes fetched successfully', type: CircleSharedNoteEntity, isArray: true })
  listSharedNotes(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<CircleSharedNoteEntity[]> {
    return this.circlesService.listSharedNotes(id, currentUser);
  }

  @Post(':id/shared-notes')
  @ApiOperation({ summary: 'Share one of your notes into a circle' })
  @ApiParam({ name: 'id', description: 'Circle UUID' })
  @ApiBody({ type: ShareCircleNoteDto })
  @ApiCreatedResponse({ description: 'Note shared successfully', type: CircleSharedNoteEntity })
  shareNote(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() shareCircleNoteDto: ShareCircleNoteDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<CircleSharedNoteEntity> {
    return this.circlesService.shareNote(id, shareCircleNoteDto, currentUser);
  }

  @Delete(':id/shared-notes/:noteId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove a shared note from a circle' })
  @ApiParam({ name: 'id', description: 'Circle UUID' })
  @ApiParam({ name: 'noteId', description: 'Note UUID' })
  @ApiOkResponse({
    description: 'Shared note removed successfully',
    schema: { example: { message: 'Shared note removed successfully' } },
  })
  unshareNote(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('noteId', new ParseUUIDPipe()) noteId: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<{ message: string }> {
    return this.circlesService.unshareNote(id, noteId, currentUser);
  }
}