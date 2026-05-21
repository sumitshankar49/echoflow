import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { CirclesService } from './circles.service';
import { CreateCircleDto } from './dto/create-circle.dto';
import { InviteCircleMemberDto } from './dto/invite-circle-member.dto';
import { CircleMember } from './entities/circle-member.entity';
import { Circle } from './entities/circle.entity';
export declare class CirclesController {
    private readonly circlesService;
    constructor(circlesService: CirclesService);
    findAll(currentUser: AuthenticatedUser): Promise<Circle[]>;
    create(createCircleDto: CreateCircleDto, currentUser: AuthenticatedUser): Promise<Circle>;
    findOne(id: string, currentUser: AuthenticatedUser): Promise<Circle>;
    inviteMember(id: string, inviteCircleMemberDto: InviteCircleMemberDto, currentUser: AuthenticatedUser): Promise<CircleMember>;
}
