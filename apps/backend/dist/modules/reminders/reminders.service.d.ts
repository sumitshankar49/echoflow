import { Repository } from 'typeorm';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';
import { Reminder } from './entities/reminder.entity';
export declare class RemindersService {
    private readonly remindersRepository;
    constructor(remindersRepository: Repository<Reminder>);
    create(createReminderDto: CreateReminderDto, currentUser: AuthenticatedUser): Promise<Reminder>;
    findAll(currentUser: AuthenticatedUser): Promise<Reminder[]>;
    findOne(id: string, currentUser: AuthenticatedUser): Promise<Reminder>;
    update(id: string, updateReminderDto: UpdateReminderDto, currentUser: AuthenticatedUser): Promise<Reminder>;
    remove(id: string, currentUser: AuthenticatedUser): Promise<{
        message: string;
    }>;
}
