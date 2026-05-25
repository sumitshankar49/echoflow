import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { ReminderFilterDto } from './dto/reminder-filter.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';
import { Reminder } from './entities/reminder.entity';
export declare class RemindersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private toReminderEntity;
    create(createReminderDto: CreateReminderDto, currentUser: AuthenticatedUser): Promise<Reminder>;
    findAll(currentUser: AuthenticatedUser, filter?: ReminderFilterDto): Promise<PaginatedResponseDto<Reminder>>;
    findOne(id: string, currentUser: AuthenticatedUser): Promise<Reminder>;
    update(id: string, updateReminderDto: UpdateReminderDto, currentUser: AuthenticatedUser): Promise<Reminder>;
    remove(id: string, currentUser: AuthenticatedUser): Promise<{
        message: string;
    }>;
}
