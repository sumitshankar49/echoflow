import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { User } from '../../database/entities/user.entity';
import { MailService } from '../mail/mail.service';
import { CreateCircleDto } from './dto/create-circle.dto';
import { InviteCircleMemberDto } from './dto/invite-circle-member.dto';
import { UpdateCircleDto } from './dto/update-circle.dto';
import { CircleMember } from './entities/circle-member.entity';
import { Circle } from './entities/circle.entity';
export declare class CirclesService {
    private readonly circlesRepository;
    private readonly circleMembersRepository;
    private readonly usersRepository;
    private readonly configService;
    private readonly mailService;
    constructor(circlesRepository: Repository<Circle>, circleMembersRepository: Repository<CircleMember>, usersRepository: Repository<User>, configService: ConfigService, mailService: MailService);
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
}
