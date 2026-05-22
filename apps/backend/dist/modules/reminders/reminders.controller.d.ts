import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { ReminderFilterDto } from './dto/reminder-filter.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';
import { Reminder } from './entities/reminder.entity';
import { RemindersService } from './reminders.service';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
export declare class RemindersController {
    private readonly remindersService;
    constructor(remindersService: RemindersService);
    findAll(filter: ReminderFilterDto, currentUser: AuthenticatedUser): Promise<PaginatedResponseDto<Reminder>>;
    create(createReminderDto: CreateReminderDto, currentUser: AuthenticatedUser): Promise<Reminder>;
    findOne(id: string, currentUser: AuthenticatedUser): Promise<Reminder>;
    update(id: string, updateReminderDto: UpdateReminderDto, currentUser: AuthenticatedUser): Promise<Reminder>;
    remove(id: string, currentUser: AuthenticatedUser): Promise<{
        message: string;
    }>;
}
