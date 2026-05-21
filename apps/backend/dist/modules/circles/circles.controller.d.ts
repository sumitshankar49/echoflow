import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { CirclesService } from './circles.service';
import { CreateCircleDto } from './dto/create-circle.dto';
import { InviteCircleMemberDto } from './dto/invite-circle-member.dto';
import { ShareCircleNoteDto } from './dto/share-circle-note.dto';
import { CircleMember } from './entities/circle-member.entity';
import { CircleSharedNote } from './entities/circle-shared-note.entity';
import { Circle } from './entities/circle.entity';
export declare class CirclesController {
    private readonly circlesService;
    constructor(circlesService: CirclesService);
    create(createCircleDto: CreateCircleDto, currentUser: AuthenticatedUser): Promise<Circle>;
    findAll(currentUser: AuthenticatedUser): Promise<Circle[]>;
    inviteMember(circleId: string, inviteCircleMemberDto: InviteCircleMemberDto, currentUser: AuthenticatedUser): Promise<CircleMember>;
    getMembers(circleId: string, currentUser: AuthenticatedUser): Promise<CircleMember[]>;
    shareNote(circleId: string, shareCircleNoteDto: ShareCircleNoteDto, currentUser: AuthenticatedUser): Promise<CircleSharedNote>;
    getSharedNotes(circleId: string, currentUser: AuthenticatedUser): Promise<CircleSharedNote[]>;
}
