import { Repository } from 'typeorm';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../database/entities/user.entity';
import { Note } from '../notes/entities/note.entity';
import { CreateCircleDto } from './dto/create-circle.dto';
import { InviteCircleMemberDto } from './dto/invite-circle-member.dto';
import { ShareCircleNoteDto } from './dto/share-circle-note.dto';
import { CircleMember } from './entities/circle-member.entity';
import { CircleSharedNote } from './entities/circle-shared-note.entity';
import { Circle } from './entities/circle.entity';
export declare class CirclesService {
    private readonly circlesRepository;
    private readonly circleMembersRepository;
    private readonly circleSharedNotesRepository;
    private readonly usersRepository;
    private readonly notesRepository;
    constructor(circlesRepository: Repository<Circle>, circleMembersRepository: Repository<CircleMember>, circleSharedNotesRepository: Repository<CircleSharedNote>, usersRepository: Repository<User>, notesRepository: Repository<Note>);
    create(createCircleDto: CreateCircleDto, currentUser: AuthenticatedUser): Promise<Circle>;
    findAll(currentUser: AuthenticatedUser): Promise<Circle[]>;
    inviteMember(circleId: string, inviteDto: InviteCircleMemberDto, currentUser: AuthenticatedUser): Promise<CircleMember>;
    getMembers(circleId: string, currentUser: AuthenticatedUser): Promise<CircleMember[]>;
    shareNote(circleId: string, shareCircleNoteDto: ShareCircleNoteDto, currentUser: AuthenticatedUser): Promise<CircleSharedNote>;
    getSharedNotes(circleId: string, currentUser: AuthenticatedUser): Promise<CircleSharedNote[]>;
    private ensureOwnedCircle;
    private ensureCircleAccessible;
}
