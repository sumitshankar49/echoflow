import { ConfigService } from '@nestjs/config';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { CreateCircleDto } from './dto/create-circle.dto';
import { InviteCircleMemberDto } from './dto/invite-circle-member.dto';
import { ShareCircleNoteDto } from './dto/share-circle-note.dto';
import { UpdateCircleDto } from './dto/update-circle.dto';
import { CircleMember } from './entities/circle-member.entity';
import { CircleSharedNoteEntity } from './entities/circle-shared-note.entity';
import { Circle } from './entities/circle.entity';
export declare class CirclesService {
    private readonly prisma;
    private readonly configService;
    private readonly mailService;
    constructor(prisma: PrismaService, configService: ConfigService, mailService: MailService);
    private readonly safeUserSelect;
    private mapTagsFromDb;
    private mapSharedNote;
    private getCircleAccess;
    private getCircleCollaboratorAccess;
    private attachMembers;
    create(createCircleDto: CreateCircleDto, currentUser: AuthenticatedUser): Promise<Circle>;
    findAll(currentUser: AuthenticatedUser, pagination?: PaginationQueryDto): Promise<PaginatedResponseDto<Circle>>;
    findOne(id: string, currentUser: AuthenticatedUser): Promise<Circle>;
    update(id: string, updateCircleDto: UpdateCircleDto, currentUser: AuthenticatedUser): Promise<Circle>;
    remove(id: string, currentUser: AuthenticatedUser): Promise<{
        message: string;
    }>;
    acceptInvitation(circleId: string, currentUser: AuthenticatedUser): Promise<CircleMember>;
    declineInvitation(circleId: string, currentUser: AuthenticatedUser): Promise<{
        message: string;
    }>;
    removeMember(circleId: string, memberId: string, currentUser: AuthenticatedUser): Promise<{
        message: string;
    }>;
    leaveCircle(circleId: string, currentUser: AuthenticatedUser): Promise<{
        message: string;
    }>;
    inviteMember(circleId: string, inviteDto: InviteCircleMemberDto, currentUser: AuthenticatedUser): Promise<CircleMember | {
        message: string;
    }>;
    listSharedNotes(circleId: string, currentUser: AuthenticatedUser): Promise<CircleSharedNoteEntity[]>;
    shareNote(circleId: string, shareCircleNoteDto: ShareCircleNoteDto, currentUser: AuthenticatedUser): Promise<CircleSharedNoteEntity>;
    unshareNote(circleId: string, noteId: string, currentUser: AuthenticatedUser): Promise<{
        message: string;
    }>;
}
