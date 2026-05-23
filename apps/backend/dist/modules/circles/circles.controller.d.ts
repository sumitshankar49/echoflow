import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { CirclesService } from './circles.service';
import { CreateCircleDto } from './dto/create-circle.dto';
import { InviteCircleMemberDto } from './dto/invite-circle-member.dto';
import { UpdateCircleDto } from './dto/update-circle.dto';
import { CircleMember } from './entities/circle-member.entity';
import { Circle } from './entities/circle.entity';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
export declare class CirclesController {
    private readonly circlesService;
    constructor(circlesService: CirclesService);
    findAll(pagination: PaginationQueryDto, currentUser: AuthenticatedUser): Promise<PaginatedResponseDto<Circle>>;
    create(createCircleDto: CreateCircleDto, currentUser: AuthenticatedUser): Promise<Circle>;
    findOne(id: string, currentUser: AuthenticatedUser): Promise<Circle>;
    update(id: string, updateCircleDto: UpdateCircleDto, currentUser: AuthenticatedUser): Promise<Circle>;
    remove(id: string, currentUser: AuthenticatedUser): Promise<{
        message: string;
    }>;
    acceptInvitation(id: string, currentUser: AuthenticatedUser): Promise<CircleMember>;
    declineInvitation(id: string, currentUser: AuthenticatedUser): Promise<{
        message: string;
    }>;
    removeMember(id: string, memberId: string, currentUser: AuthenticatedUser): Promise<{
        message: string;
    }>;
    leaveCircle(id: string, currentUser: AuthenticatedUser): Promise<{
        message: string;
    }>;
    inviteMember(id: string, inviteCircleMemberDto: InviteCircleMemberDto, currentUser: AuthenticatedUser): Promise<CircleMember | {
        message: string;
    }>;
}
