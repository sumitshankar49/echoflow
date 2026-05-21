import { Repository } from 'typeorm';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../database/entities/user.entity';
import { CreateCircleDto } from './dto/create-circle.dto';
import { InviteCircleMemberDto } from './dto/invite-circle-member.dto';
import { CircleMember } from './entities/circle-member.entity';
import { Circle } from './entities/circle.entity';
export declare class CirclesService {
    private readonly circlesRepository;
    private readonly circleMembersRepository;
    private readonly usersRepository;
    constructor(circlesRepository: Repository<Circle>, circleMembersRepository: Repository<CircleMember>, usersRepository: Repository<User>);
    create(createCircleDto: CreateCircleDto, currentUser: AuthenticatedUser): Promise<Circle>;
    findAll(currentUser: AuthenticatedUser): Promise<Circle[]>;
    findOne(id: string, currentUser: AuthenticatedUser): Promise<Circle>;
    inviteMember(circleId: string, inviteDto: InviteCircleMemberDto, currentUser: AuthenticatedUser): Promise<CircleMember>;
}
