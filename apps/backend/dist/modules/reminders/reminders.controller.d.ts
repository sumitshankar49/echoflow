import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';
import { Reminder } from './entities/reminder.entity';
import { RemindersService } from './reminders.service';
export declare class RemindersController {
    private readonly remindersService;
    constructor(remindersService: RemindersService);
    findAll(currentUser: AuthenticatedUser): Promise<Reminder[]>;
    create(createReminderDto: CreateReminderDto, currentUser: AuthenticatedUser): Promise<Reminder>;
    update(id: string, updateReminderDto: UpdateReminderDto, currentUser: AuthenticatedUser): Promise<Reminder>;
    remove(id: string, currentUser: AuthenticatedUser): Promise<{
        message: string;
    }>;
}
